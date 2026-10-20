export type PlayRow = {
  id: string;
  gameSlug: string;
  startedAt: Date;
  endedAt: Date | null;
  summary: string | null;
  outcome?: "win" | "loss" | "done" | null;
  score?: number | null;
};

/** Highest claimed score for each game. The shelf stores the number the game sent. */
export function bestScores(rows: PlayRow[]): { gameSlug: string; score: number }[] {
  const best = new Map<string, number>();
  for (const row of rows) {
    if (typeof row.score !== "number") continue;
    const current = best.get(row.gameSlug);
    if (current === undefined || row.score > current) best.set(row.gameSlug, row.score);
  }
  return [...best.entries()]
    .map(([gameSlug, score]) => ({ gameSlug, score }))
    .sort((a, b) => b.score - a.score);
}

/** Newest session for each game, in the order those newest sessions happened. */
export function latestByGame(rows: PlayRow[]): PlayRow[] {
  const bySlug = new Map<string, PlayRow>();
  for (const row of rows) {
    const current = bySlug.get(row.gameSlug);
    if (!current || row.startedAt > current.startedAt) bySlug.set(row.gameSlug, row);
  }
  return [...bySlug.values()].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}
