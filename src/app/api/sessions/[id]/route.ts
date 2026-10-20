import { getSession } from "@/auth";
import { updatePlaySession } from "@/db";
import { parseGameResult } from "@/games/bridge";
import { sameOrigin } from "@/security/request";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    summary?: unknown;
    outcome?: unknown;
    score?: unknown;
    finished?: unknown;
    end?: unknown;
  } | null;
  const patch: { summary?: string | null; outcome?: "win" | "loss" | "done" | null; score?: number | null; end?: boolean } = {};
  if (body?.end === true) patch.end = true;
  const hasResultField = body?.summary !== undefined || body?.outcome !== undefined || body?.score !== undefined || body?.finished !== undefined;
  if (hasResultField) {
    const parsed = parseGameResult(body ?? {});
    if (!parsed) return Response.json({ ok: false, message: "That result is not a short line." }, { status: 400 });
    patch.summary = parsed.summary;
    patch.outcome = parsed.outcome;
    patch.score = parsed.score;
  }
  if (!patch.end && !hasResultField) return Response.json({ ok: false }, { status: 400 });
  try {
    const saved = await updatePlaySession(id, session.user.id, patch);
    if (saved === "limited") return Response.json({ ok: false, message: "This play already has enough results." }, { status: 429 });
    return Response.json({ ok: saved === "saved" }, { status: saved === "saved" ? 200 : 404 });
  } catch (error) {
    console.error("play session update failed", error);
    return Response.json({ ok: false, message: "Your play history could not be updated." }, { status: 503 });
  }
}
