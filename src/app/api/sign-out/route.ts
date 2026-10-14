import { getAuth } from "@/auth";

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
  if (!sameOrigin(request)) return new Response("That request came from the wrong site.", { status: 403 });
  const auth = getAuth();
  if (auth) await auth.api.signOut({ headers: request.headers });
  return Response.redirect(new URL("/", request.url), 303);
}
