import { expect, test } from "vitest";
import { createCatalogLoader } from "./catalog-cache";

test("catalog reads collapse onto one fetch until the ttl or a save", async () => {
  let now = 0;
  let reads = 0;
  const loader = createCatalogLoader(async () => {
    reads += 1;
    return reads;
  }, 30_000, () => now);

  expect(await loader.load()).toBe(1);
  expect(await loader.load()).toBe(1);
  now = 29_999;
  expect(await loader.load()).toBe(1);
  now = 30_000;
  expect(await loader.load()).toBe(2);
  loader.invalidate();
  expect(await loader.load()).toBe(3);
  expect(reads).toBe(3);
});

test("concurrent catalog reads share one database read", async () => {
  let release: (value: string) => void = () => undefined;
  const gate = new Promise<string>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  const loader = createCatalogLoader(() => {
    reads += 1;
    return gate;
  }, 30_000, () => 0);

  const pending = Promise.all(Array.from({ length: 50 }, () => loader.load()));
  expect(reads).toBe(1);
  release("shelf");
  await expect(pending).resolves.toEqual(Array.from({ length: 50 }, () => "shelf"));
  expect(await loader.load()).toBe("shelf");
  expect(reads).toBe(1);
});

test("a read that finishes after an operator save does not put stale rows back", async () => {
  let release: (value: string) => void = () => undefined;
  const gate = new Promise<string>((resolve) => {
    release = resolve;
  });
  let phase: "stale" | "fresh" = "stale";
  const loader = createCatalogLoader(() => phase === "stale" ? gate : Promise.resolve("fresh"), 30_000, () => 0);

  const first = loader.load();
  loader.invalidate();
  phase = "fresh";
  expect(await loader.load()).toBe("fresh");
  release("stale");
  expect(await first).toBe("stale");
  expect(await loader.load()).toBe("fresh");
});

test("a failed catalog read is not cached", async () => {
  let fail = true;
  const loader = createCatalogLoader(async () => {
    if (fail) throw new Error("database down");
    return "shelf";
  }, 30_000, () => 0);

  await expect(loader.load()).rejects.toThrow("database down");
  fail = false;
  await expect(loader.load()).resolves.toBe("shelf");
});
