import { expect, test } from "vitest";
import { latestByGame, type PlayRow } from "./history";

function row(slug: string, minute: number, summary: string | null = null): PlayRow {
  return {
    id: `${slug}-${minute}`,
    gameSlug: slug,
    startedAt: new Date(Date.UTC(2026, 9, 14, 12, minute)),
    endedAt: null,
    summary,
  };
}

test("history keeps the newest session of each game", () => {
  const latest = latestByGame([
    row("velocity", 1),
    row("velocity", 20, "2nd · Midnight District"),
    row("vanguard", 5),
  ]);
  expect(latest.map((item) => item.id)).toEqual(["velocity-20", "vanguard-5"]);
  expect(latest[0]?.summary).toBe("2nd · Midnight District");
});
