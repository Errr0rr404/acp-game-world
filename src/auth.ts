import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { consumeSignInGate, getDb } from "@/db";
import * as schema from "@/db/schema";
import { accountsEnabled } from "@/games/policy";

const devLinks = new Map<string, string>();

export function takeDevLink(email: string): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const link = devLinks.get(email) ?? null;
  devLinks.delete(email);
  return link;
}

async function deliverSignInLink(email: string, url: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Game World <games@agentcontrolpanel.dev>",
        to: [email],
        subject: "Your Game World sign-in link",
        text: `Sign in to Game World:\n\n${url}\n\nThis link expires in 15 minutes. If you did not ask for it, you can ignore this email.`,
      }),
    });
    if (!response.ok) throw new Error("email failed");
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("mailer-missing");
  devLinks.set(email, url);
  console.info(`sign-in link for ${email}: ${url}`);
}

function createAuth(db: NonNullable<ReturnType<typeof getDb>>, secret: string) {
  return betterAuth({
    appName: "Game World",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000",
    secret,
    trustedOrigins: [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "https://game.agentcontrolpanel.dev",
    ],
    database: drizzleAdapter(db, { provider: "pg", schema }),
    user: {
      additionalFields: {
        over13: { type: "boolean", required: false, defaultValue: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (created) => {
            const local = created.email.split("@")[0]?.slice(0, 40) || "Player";
            await db
              .update(schema.user)
              .set({ over13: true, name: created.name && created.name !== created.email ? created.name : local, updatedAt: new Date() })
              .where(eq(schema.user.id, created.id));
          },
        },
      },
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        sendMagicLink: async ({ email, url }) => {
          const allowed = await consumeSignInGate(email.toLowerCase());
          if (!allowed) throw new Error("age gate missing");
          await deliverSignInLink(email, url);
        },
      }),
      nextCookies(),
    ],
  });
}

let authInstance: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  if (!accountsEnabled()) return null;
  if (authInstance) return authInstance;
  const db = getDb();
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!db || !secret) return null;
  authInstance = createAuth(db, secret);
  return authInstance;
}

export async function getSession() {
  const auth = getAuth();
  if (!auth) return null;
  const { headers } = await import("next/headers");
  return auth.api.getSession({ headers: await headers() });
}
