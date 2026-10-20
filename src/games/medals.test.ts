import { expect, test } from "vitest";
import { GAME_GENRES } from "./catalog";
import { shelfMedals } from "./medals";

test("medals count different games, categories, and days", () => {
  const plays = [
    { gameSlug: "a", startedAt: new Date("2026-10-01T12:00:00Z") },
    { gameSlug: "a", startedAt: new Date("2026-10-02T12:00:00Z") },
    { gameSlug: "b", startedAt: new Date("2026-10-03T12:00:00Z") },
  ];
  const medals = shelfMedals(plays, () => "Arcade");
  expect(medals.find((medal) => medal.id === "first-game")?.earned).toBe(true);
  expect(medals.find((medal) => medal.id === "five-games")?.earned).toBe(false);
  expect(medals.find((medal) => medal.id === "three-days")?.earned).toBe(true);
  expect(medals.find((medal) => medal.id === "every-category")?.earned).toBe(false);

  const covered = GAME_GENRES.map((genre, index) => ({
    gameSlug: `game-${index}`,
    startedAt: new Date("2026-10-04T12:00:00Z"),
  }));
  const all = shelfMedals(covered, (slug) => GAME_GENRES[Number(slug.split("-")[1])] ?? null);
  expect(all.find((medal) => medal.id === "every-category")?.earned).toBe(true);
});
