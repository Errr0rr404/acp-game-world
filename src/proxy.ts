import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAIN_HOST = "games.agentcontrolpanel.dev";
const ALIAS_HOST = "game.agentcontrolpanel.dev";

/** The old hostname stays as an alias and sends people to the main site. */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .replace(/:\d+$/, "");
  if (host !== ALIAS_HOST) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = MAIN_HOST;
  return NextResponse.redirect(url, 308);
}
