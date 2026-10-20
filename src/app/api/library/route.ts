import { getSession } from "@/auth";
import { loadGames, mergeSavedGames, savedSlugsForUser, setSavedGame } from "@/db";
import { LIBRARY_SLUG } from "@/games/library";
import { sameOrigin } from "@/security/request";

async function knownSlug(slug: string): Promise<boolean> {
  if (!LIBRARY_SLUG.test(slug)) return false;
  const games = await loadGames();
  return games.some((game) => game.slug === slug);
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  try {
    return Response.json({ ok: true, saved: await savedSlugsForUser(session.user.id) });
  } catch (error) {
    console.error("saved games could not be read", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { slug?: unknown; saved?: unknown; slugs?: unknown } | null;
  try {
    if (Array.isArray(body?.slugs)) {
      const slugs: string[] = [];
      for (const slug of body.slugs) {
        if (typeof slug === "string" && await knownSlug(slug)) slugs.push(slug);
      }
      return Response.json({ ok: true, saved: await mergeSavedGames(session.user.id, slugs.slice(0, 100)) });
    }
    if (typeof body?.slug !== "string" || typeof body.saved !== "boolean" || !await knownSlug(body.slug)) {
      return Response.json({ ok: false }, { status: 400 });
    }
    await setSavedGame(session.user.id, body.slug, body.saved);
    return Response.json({ ok: true, saved: await savedSlugsForUser(session.user.id) });
  } catch (error) {
    console.error("saved games could not be updated", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
