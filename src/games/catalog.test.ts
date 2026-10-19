import { describe, expect, test } from "vitest";
import {
  assertCatalog,
  frameSrc,
  games,
  getGame,
  isHttpsOrigin,
  playSrc,
  type GameListing,
} from "./catalog";

function listing(overrides: Partial<GameListing>): GameListing {
  return {
    slug: "sample",
    title: "Sample",
    tagline: "A game.",
    status: "playable",
    origin: "https://games.example",
    poster: "/posters/sample.jpg",
    controls: "Keyboard",
    soonReason: null,
    ...overrides,
  };
}

describe("catalog", () => {
  test("frames Velocity at its own origin and nowhere else", () => {
    expect(playSrc(getGame("velocity")!)).toBe("https://racing.worldofz.info/");
    expect(frameSrc(getGame("velocity")!)).toBe("https://racing.worldofz.info/?hub=1");
    expect(getGame("vanguard")).toBeUndefined();
    expect(playSrc(getGame("flap-flap-fly")!)).toBe("https://flap-flap-fly.liveapps.dev/");
    expect(frameSrc(getGame("flap-flap-fly")!)).toBe("https://flap-flap-fly.liveapps.dev/?hub=1");
    expect(playSrc(getGame("scrapyard-fps")!)).toBe("https://scrapyard-fps.liveapps.dev/");
    expect(frameSrc(getGame("scrapyard-fps")!)).toBe("https://scrapyard-fps.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("sundial-dash")!)).toBe("https://sundial-dash.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("voxel-rivals")!)).toBe("https://voxel-rivals.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("tetherfly")!)).toBe("https://tetherfly.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("stunt-ridge")!)).toBe("https://stunt-ridge.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("wicks-end")!)).toBe("https://wicks-end.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("wordwell")!)).toBe("https://wordwell.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("sweet-snip")!)).toBe("https://sweet-snip.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("lab-escape")!)).toBe("https://lab-escape.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("monster-haul")!)).toBe("https://monster-haul.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("balloon-bastion")!)).toBe("https://balloon-bastion.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("inkland")!)).toBe("https://inkland.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("corner-pocket")!)).toBe("https://corner-pocket.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("patience-parlor")!)).toBe("https://patience-parlor.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("glowtail")!)).toBe("https://glowtail.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("twofold")!)).toBe("https://twofold.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("beatline")!)).toBe("https://beatline.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("rim-rivals")!)).toBe("https://rim-rivals.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("bubble-reef")!)).toBe("https://bubble-reef.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("hop-lanes")!)).toBe("https://hop-lanes.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("orchard-drop")!)).toBe("https://orchard-drop.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("crumb-tycoon")!)).toBe("https://crumb-tycoon.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("lantern-horde")!)).toBe("https://lantern-horde.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("sinkhole")!)).toBe("https://sinkhole.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("stackfall")!)).toBe("https://stackfall.liveapps.dev/?hub=1");
    expect(frameSrc(getGame("ember-and-tide")!)).toBe("https://ember-and-tide.liveapps.dev/?hub=1");
    expect(getGame("missing")).toBeUndefined();
    expect(games.filter((game) => game.status === "playable")).toHaveLength(9);
  });

  test("accepts only a bare https origin", () => {
    expect(isHttpsOrigin("https://racing.worldofz.info")).toBe(true);
    expect(isHttpsOrigin("https://racing.worldofz.info/")).toBe(true);
    expect(isHttpsOrigin("http://racing.worldofz.info")).toBe(false);
    expect(isHttpsOrigin("https://racing.worldofz.info/play")).toBe(false);
    expect(isHttpsOrigin("https://user:pass@racing.worldofz.info")).toBe(false);
    expect(isHttpsOrigin("https://racing.worldofz.info:8443")).toBe(false);
    expect(isHttpsOrigin("https://racing.worldofz.info/?next=1")).toBe(false);
    expect(isHttpsOrigin("not a url")).toBe(false);
  });

  test("rejects a playable game that could frame an unapproved address", () => {
    expect(() =>
      assertCatalog([listing({ origin: "https://evil.example/game" })]),
    ).toThrow(/https origin/);
    expect(() => assertCatalog([listing({ origin: null })])).toThrow(/https origin/);
    expect(() =>
      assertCatalog([
        listing({ slug: "soon-game", status: "soon", origin: "https://games.example", soonReason: "Later." }),
      ]),
    ).toThrow(/soon but has an origin/);
    expect(() =>
      assertCatalog([
        listing({ slug: "one" }),
        listing({ slug: "one", title: "Again" }),
      ]),
    ).toThrow(/duplicate slug/);
  });
});
