/** How long a successful catalog read is reused. Operator saves drop it sooner. */
export const CATALOG_TTL_MS = 30_000;

export type CatalogLoader<T> = {
  load(): Promise<T>;
  invalidate(): void;
};

/**
 * One shared read per process, reused until the TTL or an explicit invalidate.
 * A read that finishes after an invalidate does not refill the cache.
 */
export function createCatalogLoader<T>(
  read: () => Promise<T>,
  ttlMs: number,
  // Monotonic timer. Date.now() is rejected while Next prerenders a route, and this value is not shown.
  now: () => number = () => performance.now(),
): CatalogLoader<T> {
  let cache: { at: number; value: T } | null = null;
  let generation = 0;
  let pending: Promise<T> | null = null;

  return {
    invalidate() {
      generation += 1;
      cache = null;
      pending = null;
    },
    async load() {
      const current = generation;
      if (cache && now() - cache.at < ttlMs) return cache.value;
      if (!pending) {
        const flight = read().finally(() => {
          if (pending === flight) pending = null;
        });
        pending = flight;
      }
      const value = await pending;
      if (current === generation) cache = { at: now(), value };
      return value;
    },
  };
}
