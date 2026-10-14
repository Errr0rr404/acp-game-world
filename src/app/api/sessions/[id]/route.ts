import { getSession } from "@/auth";
import { updatePlaySession } from "@/db";
import { parseGameMessage } from "@/games/bridge";
import { sameOrigin } from "@/security/request";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { summary?: unknown; end?: unknown } | null;
  const patch: { summary?: string; end?: boolean } = {};
  if (body?.end === true) patch.end = true;
  if (typeof body?.summary === "string") {
    const parsed = parseGameMessage(
      { type: "game.result", v: 1, summary: body.summary },
      "https://hub.local",
      "https://hub.local",
    );
    if (!parsed || parsed.type !== "game.result") {
      return Response.json({ ok: false, message: "That result is not a short line." }, { status: 400 });
    }
    patch.summary = parsed.summary;
  }
  if (!patch.end && !patch.summary) return Response.json({ ok: false }, { status: 400 });
  try {
    const saved = await updatePlaySession(id, session.user.id, patch);
    return Response.json({ ok: saved }, { status: saved ? 200 : 404 });
  } catch (error) {
    console.error("play session update failed", error);
    return Response.json({ ok: false, message: "Your play history could not be updated." }, { status: 503 });
  }
}
