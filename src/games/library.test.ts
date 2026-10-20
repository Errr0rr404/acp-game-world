import { describe, expect, test } from "vitest";
import { games } from "./catalog";
import { EMPTY_LIBRARY, filterGames, parseLibrary, withRecentGame, withSavedGame } from "./library";

describe("browser library", () => {
  test("recovers from corrupt storage and untrusted shapes", () => {
    for (const raw of [null, "not-json", "null", "42", '"hello"']) expect(parseLibrary(raw)).toEqual(EMPTY_LIBRARY);
    expect(parseLibrary(JSON.stringify({ saved: ["velocity", "velocity", 7, "../bad"], recent: [{ slug: "velocity", lastPlayed: 10 }, { slug: "velocity", lastPlayed: 30 }, { slug: "vanguard", lastPlayed: -2 }, { slug: "bad slug", lastPlayed: 50 }] })))
      .toEqual({ saved: ["velocity"], recent: [{ slug: "velocity", lastPlayed: 30 }] });
  });

  test("saving is reversible and does not mutate the previous snapshot", () => {
    const saved = withSavedGame(EMPTY_LIBRARY, "velocity");
    expect(saved.saved).toEqual(["velocity"]);
    expect(EMPTY_LIBRARY.saved).toEqual([]);
    expect(withSavedGame(saved, "velocity").saved).toEqual([]);
    expect(withSavedGame(saved, "../bad")).toBe(saved);
  });

  test("a replay moves the game to the front without duplicating it", () => {
    let library = withRecentGame(EMPTY_LIBRARY, "velocity", 10);
    library = withRecentGame(library, "vanguard", 20);
    library = withRecentGame(library, "velocity", 30);
    expect(library.recent).toEqual([{ slug: "velocity", lastPlayed: 30 }, { slug: "vanguard", lastPlayed: 20 }]);
    expect(withRecentGame(library, "velocity", NaN)).toBe(library);
  });

  test("keeps bounded lists after many games or oversized storage", () => {
    const entries = Array.from({ length: 150 }, (_, index) => ({ slug: `game-${index}`, lastPlayed: index + 1 }));
    const library = parseLibrary(JSON.stringify({ saved: entries.map((entry) => entry.slug), recent: entries }));
    expect(library.saved).toHaveLength(100);
    expect(library.recent).toHaveLength(25);
    expect(library.recent[0]?.slug).toBe("game-149");
  });
});

describe("game discovery", () => {
  test("combines search words, genre, and real availability", () => {
    expect(filterGames(games, { query: "  BLUE  touch ", genre: "Racing", status: "playable" }).map((game) => game.slug)).toEqual(["velocity"]);
    expect(filterGames(
      [{ ...games[0]!, slug: "soon-game", title: "Bots", tagline: "bots", genre: "Action", status: "soon", origin: null, soonReason: "Later." }],
      { query: "bots", genre: "Action", status: "soon" },
    ).map((game) => game.slug)).toEqual(["soon-game"]);
    expect(filterGames(games, { query: "", genre: "Racing", status: "playable" }).map((game) => game.slug)).toEqual(["velocity", "stunt-ridge", "monster-haul", "glass-run", "keylane"]);
    expect(filterGames(games, { query: "", genre: "Racing", status: "soon" })).toEqual([]);
    expect(filterGames(games, { query: "missing", genre: "all", status: "all" })).toEqual([]);
    expect(filterGames([{ ...games[0]!, origin: null }], { query: "", genre: "all", status: "playable" })).toEqual([]);
  });
});
