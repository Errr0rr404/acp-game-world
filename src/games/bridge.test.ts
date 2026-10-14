import { expect, test } from "vitest";
import { parseGameMessage } from "./bridge";

const game = "https://racing.worldofz.info";

test("a result from the game origin is kept", () => {
  expect(parseGameMessage({ type: "game.result", v: 1, summary: "2nd · Midnight District" }, game, game)).toEqual({
    type: "game.result",
    summary: "2nd · Midnight District",
  });
});

test("another origin, a long line, and an unknown type are dropped", () => {
  expect(parseGameMessage({ type: "game.result", v: 1, summary: "2nd" }, "https://evil.example", game)).toBeNull();
  expect(parseGameMessage({ type: "game.result", v: 1, summary: "x".repeat(81) }, game, game)).toBeNull();
  expect(parseGameMessage({ type: "game.hack", v: 1 }, game, game)).toBeNull();
  expect(parseGameMessage({ type: "game.exit", v: 2 }, game, game)).toBeNull();
});
