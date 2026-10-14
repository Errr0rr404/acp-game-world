export type GameMessage =
  | { type: "game.ready" }
  | { type: "game.result"; summary: string }
  | { type: "game.exit" };

const SUMMARY_MAX = 80;

/** Accept a message only from the game's own origin, and only the three known kinds. */
export function parseGameMessage(data: unknown, eventOrigin: string, gameOrigin: string): GameMessage | null {
  if (eventOrigin !== gameOrigin) return null;
  if (!data || typeof data !== "object") return null;
  const message = data as { type?: unknown; v?: unknown; summary?: unknown };
  if (message.v !== 1 || typeof message.type !== "string") return null;
  if (message.type === "game.ready" || message.type === "game.exit") return { type: message.type };
  if (message.type !== "game.result" || typeof message.summary !== "string") return null;
  const summary = message.summary.replace(/\s+/g, " ").trim();
  if (!summary || summary.length > SUMMARY_MAX) return null;
  return { type: "game.result", summary };
}
