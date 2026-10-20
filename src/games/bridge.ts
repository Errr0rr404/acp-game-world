export type GameOutcome = "win" | "loss" | "done";

export type GameResult = {
  type: "game.result";
  summary: string | null;
  outcome: GameOutcome | null;
  score: number | null;
};

export type GameMessage =
  | { type: "game.ready" }
  | GameResult
  | { type: "game.exit" };

const SUMMARY_MAX = 80;
const SCORE_MAX = 999_999_999;

/** A result is a short line, a win or loss, a finished flag, or a whole-number score. */
export function parseGameResult(input: {
  summary?: unknown;
  outcome?: unknown;
  finished?: unknown;
  score?: unknown;
}): GameResult | null {
  let summary: string | null = null;
  if (input.summary !== undefined && input.summary !== null) {
    if (typeof input.summary !== "string") return null;
    const cleaned = input.summary.replace(/\s+/g, " ").trim();
    if (!cleaned || cleaned.length > SUMMARY_MAX) return null;
    summary = cleaned;
  }
  let outcome: GameOutcome | null = null;
  if (input.outcome !== undefined && input.outcome !== null) {
    if (input.outcome !== "win" && input.outcome !== "loss") return null;
    outcome = input.outcome;
  } else if (input.finished === true) {
    outcome = "done";
  } else if (input.finished !== undefined && input.finished !== false && input.finished !== null) {
    return null;
  }
  let score: number | null = null;
  if (input.score !== undefined && input.score !== null) {
    if (typeof input.score !== "number" || !Number.isInteger(input.score) || input.score < 0 || input.score > SCORE_MAX) return null;
    score = input.score;
  }
  if (!summary && !outcome && score === null) return null;
  return { type: "game.result", summary, outcome, score };
}

/** Accept a message only from the game's own origin, and only the three known kinds. */
export function parseGameMessage(data: unknown, eventOrigin: string, gameOrigin: string): GameMessage | null {
  if (eventOrigin !== gameOrigin) return null;
  if (!data || typeof data !== "object") return null;
  const message = data as { type?: unknown; v?: unknown; summary?: unknown; outcome?: unknown; finished?: unknown; score?: unknown };
  if (message.v !== 1 || typeof message.type !== "string") return null;
  if (message.type === "game.ready" || message.type === "game.exit") return { type: message.type };
  if (message.type !== "game.result") return null;
  return parseGameResult(message);
}
