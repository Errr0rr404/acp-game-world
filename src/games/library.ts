import type { GameListing } from "./catalog";
import { genreForGame, playSrc } from "./catalog";

export type LocalLibrary = {
  saved: string[];
  recent: { slug: string; lastPlayed: number }[];
};

export const EMPTY_LIBRARY: LocalLibrary = { saved: [], recent: [] };
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseLibrary(raw: string | null): LocalLibrary {
  if (!raw) return EMPTY_LIBRARY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return EMPTY_LIBRARY;
    const data = value as { saved?: unknown; recent?: unknown };
    const saved = Array.isArray(data.saved)
      ? [...new Set(data.saved.filter((slug): slug is string => typeof slug === "string" && VALID_SLUG.test(slug)))].slice(0, 100)
      : [];
    const recent = new Map<string, { slug: string; lastPlayed: number }>();
    if (Array.isArray(data.recent)) {
      for (const entry of data.recent) {
        if (!entry || typeof entry !== "object") continue;
        const { slug, lastPlayed } = entry as { slug?: unknown; lastPlayed?: unknown };
        if (typeof slug !== "string" || !VALID_SLUG.test(slug) || typeof lastPlayed !== "number" || !Number.isFinite(lastPlayed) || lastPlayed <= 0) continue;
        if (lastPlayed > (recent.get(slug)?.lastPlayed ?? 0)) recent.set(slug, { slug, lastPlayed });
      }
    }
    return { saved, recent: [...recent.values()].sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 25) };
  } catch {
    return EMPTY_LIBRARY;
  }
}

export function withSavedGame(library: LocalLibrary, slug: string): LocalLibrary {
  if (!VALID_SLUG.test(slug)) return library;
  return {
    ...library,
    saved: library.saved.includes(slug) ? library.saved.filter((item) => item !== slug) : [slug, ...library.saved].slice(0, 100),
  };
}

export function withRecentGame(library: LocalLibrary, slug: string, now: number): LocalLibrary {
  if (!VALID_SLUG.test(slug) || !Number.isFinite(now) || now <= 0) return library;
  return { ...library, recent: [{ slug, lastPlayed: now }, ...library.recent.filter((item) => item.slug !== slug)].slice(0, 25) };
}

export type GameFilters = { query: string; genre: string; status: "all" | "playable" | "soon" };

export function filterGames(games: GameListing[], filters: GameFilters): GameListing[] {
  const words = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return games.filter((game) => {
    const genre = genreForGame(game);
    const haystack = `${game.title} ${game.tagline} ${game.controls} ${genre}`.toLowerCase();
    return words.every((word) => haystack.includes(word)) &&
      (filters.genre === "all" || filters.genre === genre) &&
      (filters.status === "all" || (filters.status === "playable" ? Boolean(playSrc(game)) : !playSrc(game)));
  });
}
