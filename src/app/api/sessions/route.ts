import { getSession } from "@/auth";
import { loadGames, startPlaySession } from "@/db";
import { playSrc } from "@/games/catalog";
import { sameOrigin } from "@/security/request";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => null) as { slug?: unknown } | null;
  if (typeof body?.slug !== "string") return Response.json({ ok: false }, { status: 400 });
  try {
    const game = (await loadGames()).find((item) => item.slug === body.slug);
    if (!game || !playSrc(game)) return Response.json({ ok: false }, { status: 400 });
    const id = await startPlaySession(session.user.id, game.slug);
    return Response.json({ ok: Boolean(id), id }, { status: id ? 201 : 503 });
  } catch (error) {
    console.error("play session could not be started", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
