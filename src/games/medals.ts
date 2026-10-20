import { GAME_GENRES } from "./catalog";

export type Medal = {
  id: string;
  title: string;
  detail: string;
  earned: boolean;
};

type PlayStamp = { gameSlug: string; startedAt: Date };

/** Medals the shelf can prove from plays it recorded. A game does not award these. */
export function shelfMedals(plays: PlayStamp[], genreOf: (slug: string) => string | null): Medal[] {
  const slugs = new Set(plays.map((play) => play.gameSlug));
  const days = new Set(plays.map((play) => play.startedAt.toISOString().slice(0, 10)));
  const genres = new Set([...slugs].map(genreOf).filter((genre): genre is string => Boolean(genre)));
  const everyCategory = GAME_GENRES.every((genre) => genres.has(genre));
  return [
    { id: "first-game", title: "First game", detail: "Open any game while signed in.", earned: slugs.size >= 1 },
    { id: "five-games", title: "Five games", detail: "Play five different games.", earned: slugs.size >= 5 },
    { id: "twenty-games", title: "Twenty games", detail: "Play twenty different games.", earned: slugs.size >= 20 },
    { id: "every-category", title: "Every category", detail: "Play at least one game in each category.", earned: everyCategory },
    { id: "three-days", title: "Three days", detail: "Come back on three different days.", earned: days.size >= 3 },
  ];
}
