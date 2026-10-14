import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/auth";
import { ensureSchema } from "@/db";

const disabled = () => Response.json({ message: "Accounts are not turned on yet." }, { status: 503 });

export async function GET(request: Request) {
  const auth = getAuth();
  if (!auth) return disabled();
  try {
    await ensureSchema();
    return await toNextJsHandler(auth).GET(request);
  } catch (error) {
    console.error("account request failed", error);
    return Response.json({ message: "Sign-in is unavailable. Try again in a moment." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = getAuth();
  if (!auth) return disabled();
  try {
    await ensureSchema();
    return await toNextJsHandler(auth).POST(request);
  } catch (error) {
    console.error("account request failed", error);
    return Response.json({ message: "Sign-in is unavailable. Try again in a moment." }, { status: 503 });
  }
}
