import { getAuth, takeDevLink } from "@/auth";
import { ensureSchema, openSignInGate } from "@/db";
import { accountsEnabled, signInError } from "@/games/policy";

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, message: "That request came from the wrong site." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { email?: unknown; over13?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email : "";
  const over13 = body?.over13 === true;
  const problem = signInError({ email, over13 });
  if (problem) return Response.json({ ok: false, message: problem }, { status: 400 });
  if (!accountsEnabled()) {
    return Response.json({ ok: false, message: "Accounts are not turned on yet." }, { status: 503 });
  }
  const auth = getAuth();
  if (!auth) return Response.json({ ok: false, message: "Accounts are not turned on yet." }, { status: 503 });
  const normalized = email.trim().toLowerCase();
  try {
    await ensureSchema();
    await openSignInGate(normalized);
    await auth.api.signInMagicLink({
      body: { email: normalized, callbackURL: "/me" },
      headers: request.headers,
    });
  } catch (error) {
    const missingMail = error instanceof Error && error.message === "mailer-missing";
    return Response.json(
      { ok: false, message: missingMail ? "Sign-in email is not configured." : "The sign-in link could not be sent." },
      { status: 503 },
    );
  }
  const devLink = takeDevLink(normalized);
  return Response.json({
    ok: true,
    message: devLink ? "This server is in development, so the sign-in link is below." : "Check your email for a sign-in link.",
    devLink,
  });
}
