import { afterEach, expect, test, vi } from "vitest";
import { games } from "@/games/catalog";
import { clearFramePermissionCache, readFramePermission } from "@/games/frame";
import { createCatalogLoader } from "./catalog-cache";

afterEach(() => {
  clearFramePermissionCache();
  vi.unstubAllGlobals();
});

test("a burst of play pages does not write the catalog or refetch framing headers", async () => {
  let reads = 0;
  const writes = 0;
  const loader = createCatalogLoader(async () => {
    reads += 1;
    if (writes !== 0) throw new Error("database write during play");
    return games;
  }, 30_000, () => 0);
  const game = games.find((item) => item.origin);
  if (!game?.origin) throw new Error("expected a playable game");

  const openings = Array.from({ length: 200 }, () => loader.load());
  expect(reads).toBe(1);
  expect(writes).toBe(0);
  await Promise.all(openings);
  expect(reads).toBe(1);

  let release: (response: Response) => void = () => undefined;
  const gate = new Promise<Response>((resolve) => {
    release = resolve;
  });
  const fetchMock = vi.fn(() => gate);
  vi.stubGlobal("fetch", fetchMock);
  const ancestor = "https://game.agentcontrolpanel.dev";
  const checks = Array.from({ length: 200 }, () => readFramePermission(game.origin as string, ancestor));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  release(new Response("ok", { headers: { "content-security-policy": `frame-ancestors ${ancestor}` } }));
  const verdicts = await Promise.all(checks);
  expect(verdicts.every((verdict) => verdict === "allowed")).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  await Promise.all(Array.from({ length: 200 }, () => loader.load()));
  expect(reads).toBe(1);
  expect(writes).toBe(0);
});
