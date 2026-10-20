import { expect, test } from "vitest";
import { games } from "@/games/catalog";
import { prepareDatabase } from "./index";
import { builtinSeedStatement } from "./seed";

test("built-in games are inserted once and existing rows are not updated", () => {
  const statement = builtinSeedStatement();
  expect(statement).not.toBeNull();
  expect(statement?.sql.startsWith("INSERT IGNORE INTO `game_listing`")).toBe(true);
  expect(statement?.sql.includes("ON DUPLICATE")).toBe(false);
  const slugs = statement?.values.filter((_, index) => index % 10 === 0);
  expect(slugs).toEqual(games.map((game) => game.slug));
  expect(new Set(slugs).size).toBe(games.length);
});

test("preparing the database seeds the catalog and does not upsert it", async () => {
  const calls: { sql: string; values?: unknown[] }[] = [];
  const pool = {
    async query(sql: string, values?: unknown[]) {
      calls.push({ sql, values });
      if (sql.includes("information_schema")) return [[{ present: 1 }]];
      return [{ affectedRows: 1 }];
    },
  };
  await prepareDatabase(pool as never);
  const inserts = calls.filter((call) => call.sql.includes("INSERT"));
  expect(inserts).toHaveLength(1);
  expect(inserts[0]?.sql).toContain("INSERT IGNORE");
  expect(inserts[0]?.sql).not.toContain("ON DUPLICATE");
  expect(calls.some((call) => call.sql.includes("ON DUPLICATE KEY UPDATE"))).toBe(false);
});
