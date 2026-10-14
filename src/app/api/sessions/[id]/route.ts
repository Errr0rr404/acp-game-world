import { getSession } from "@/auth";
import { updatePlaySession } from "@/db";
import { parseGameMessage } from "@/games/bridge";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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
  const saved = await updatePlaySession(id, session.user.id, patch);
  return Response.json({ ok: saved }, { status: saved ? 200 : 404 });
}
