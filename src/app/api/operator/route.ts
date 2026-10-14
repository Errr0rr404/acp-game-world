import { getSession } from "@/auth";
import { saveListing } from "@/db";
import { isHttpsOrigin } from "@/games/catalog";
import { approvedOrigins, isOperator } from "@/games/policy";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POSTER = /^\/posters\/[a-z0-9-]+\.(?:jpg|png|webp)$/;

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

export function listingError(input: {
  slug: string;
  title: string;
  tagline: string;
  status: string;
  origin: string;
  poster: string;
  controls: string;
}): string | null {
  if (!SLUG.test(input.slug)) return "Use a short slug like velocity.";
  if (!input.title.trim() || !input.tagline.trim() || !input.controls.trim()) return "Title, tagline, and controls are required.";
  if (!POSTER.test(input.poster)) return "The poster must be a file in /posters.";
  if (input.status !== "playable" && input.status !== "soon") return "Status must be playable or soon.";
  if (input.status === "soon") return null;
  if (!isHttpsOrigin(input.origin) || !approvedOrigins().includes(input.origin)) {
    return "That address is not on the approved list.";
  }
  return null;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.redirect(new URL("/", request.url), 303);
  const session = await getSession();
  if (!session || !isOperator(session.user.email)) return Response.redirect(new URL("/", request.url), 303);
  const form = await request.formData();
  const input = {
    slug: String(form.get("slug") ?? "").trim(),
    title: String(form.get("title") ?? "").trim(),
    tagline: String(form.get("tagline") ?? "").trim(),
    status: String(form.get("status") ?? ""),
    origin: String(form.get("origin") ?? "").trim(),
    poster: String(form.get("poster") ?? "").trim(),
    controls: String(form.get("controls") ?? "").trim(),
    soonReason: String(form.get("soonReason") ?? "").trim(),
  };
  const problem = listingError(input);
  const back = new URL("/operator", request.url);
  if (problem) {
    back.searchParams.set("error", problem);
    return Response.redirect(back, 303);
  }
  await saveListing({
    slug: input.slug,
    title: input.title,
    tagline: input.tagline,
    status: input.status === "playable" ? "playable" : "soon",
    origin: input.status === "playable" ? input.origin : null,
    poster: input.poster,
    controls: input.controls,
    soonReason: input.status === "soon" ? input.soonReason || "Not on the web yet." : null,
  });
  back.searchParams.set("saved", input.slug);
  return Response.redirect(back, 303);
}
