export type PlayRow = {
  id: string;
  gameSlug: string;
  startedAt: Date;
  endedAt: Date | null;
  summary: string | null;
};

/** Newest session for each game, in the order those newest sessions happened. */
export function latestByGame(rows: PlayRow[]): PlayRow[] {
  const bySlug = new Map<string, PlayRow>();
  for (const row of rows) {
    const current = bySlug.get(row.gameSlug);
    if (!current || row.startedAt > current.startedAt) bySlug.set(row.gameSlug, row);
  }
  return [...bySlug.values()].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}
