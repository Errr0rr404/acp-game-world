import { getAuth } from "@/auth";
import { sameOrigin } from "@/security/request";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("That request came from the wrong site.", { status: 403 });
  const auth = getAuth();
  if (auth) await auth.api.signOut({ headers: request.headers });
  return Response.redirect(new URL("/", request.url), 303);
}
