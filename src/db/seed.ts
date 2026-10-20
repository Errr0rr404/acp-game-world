import { games } from "@/games/catalog";

const SEED_COLUMNS = "(slug, title, tagline, status, origin, poster, controls, soon_reason, sort, genre)";

/** Insert built-in games without touching rows an operator has already edited. */
export function builtinSeedStatement(): { sql: string; values: unknown[] } | null {
  if (games.length === 0) return null;
  const rows = games.map((game, sort) => [
    game.slug,
    game.title,
    game.tagline,
    game.status,
    game.origin,
    game.poster,
    game.controls,
    game.soonReason,
    sort,
    game.genre ?? null,
  ]);
  const placeholders = rows.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
  return {
    sql: `INSERT IGNORE INTO \`game_listing\` ${SEED_COLUMNS} VALUES ${placeholders}`,
    values: rows.flat(),
  };
}

export async function seedBuiltinGames(
  query: (sql: string, values?: unknown[]) => Promise<unknown>,
): Promise<void> {
  const statement = builtinSeedStatement();
  if (!statement) return;
  await query(statement.sql, statement.values);
}
