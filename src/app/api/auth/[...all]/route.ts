import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/auth";

const disabled = () => Response.json({ message: "Accounts are not turned on yet." }, { status: 503 });

export async function GET(request: Request) {
  const auth = getAuth();
  if (!auth) return disabled();
  return toNextJsHandler(auth).GET(request);
}

export async function POST(request: Request) {
  const auth = getAuth();
  if (!auth) return disabled();
  return toNextJsHandler(auth).POST(request);
}
