import { getSession } from "@/auth";
import { saveListing } from "@/db";
import { GAME_GENRES, isHttpsOrigin, type GameGenre } from "@/games/catalog";
import { approvedOrigins, isOperator } from "@/games/policy";
import { sameOrigin } from "@/security/request";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POSTER = /^\/posters\/[a-z0-9-]+\.(?:jpg|png|webp)$/;

export function listingError(input: {
  slug: string;
  title: string;
  tagline: string;
  status: string;
  origin: string;
  poster: string;
  controls: string;
  genre?: string;
}): string | null {
  if (input.slug.length > 64 || !SLUG.test(input.slug)) return "Use a short slug like velocity.";
  if (!input.title.trim() || !input.tagline.trim() || !input.controls.trim()) return "Title, tagline, and controls are required.";
  if (input.title.length > 80 || input.tagline.length > 240 || input.controls.length > 120) return "Keep titles under 80 characters, descriptions under 240, and controls under 120.";
  if (input.genre !== undefined && !GAME_GENRES.includes(input.genre as GameGenre)) return "Choose a genre from the list.";
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
  const form = await request.formData().catch(() => null);
  if (!form) return new Response("The game details could not be read.", { status: 400 });
  const input = {
    slug: String(form.get("slug") ?? "").trim(),
    title: String(form.get("title") ?? "").trim(),
    genre: String(form.get("genre") ?? "Arcade"),
    tagline: String(form.get("tagline") ?? "").trim(),
    status: String(form.get("status") ?? ""),
    origin: String(form.get("origin") ?? "").trim(),
    poster: String(form.get("poster") ?? "").trim(),
    controls: String(form.get("controls") ?? "").trim(),
    soonReason: String(form.get("soonReason") ?? "").trim(),
  };
  const problem = listingError(input) ?? (input.soonReason.length > 240 ? "Keep the upcoming game message under 240 characters." : null);
  const back = new URL("/operator", request.url);
  if (problem) {
    back.searchParams.set("error", problem);
    return Response.redirect(back, 303);
  }
  try {
    await saveListing({
      slug: input.slug,
      title: input.title,
      genre: input.genre as GameGenre,
      tagline: input.tagline,
      status: input.status === "playable" ? "playable" : "soon",
      origin: input.status === "playable" ? input.origin : null,
      poster: input.poster,
      controls: input.controls,
      soonReason: input.status === "soon" ? input.soonReason || "Not on the web yet." : null,
    });
  } catch (error) {
    console.error("game listing could not be saved", error);
    back.searchParams.set("error", "The game could not be saved. Try again in a moment.");
    return Response.redirect(back, 303);
  }
  back.searchParams.set("saved", input.slug);
  return Response.redirect(back, 303);
}
