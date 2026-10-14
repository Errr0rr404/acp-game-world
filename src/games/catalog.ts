export type GameStatus = "playable" | "soon";
export const GAME_GENRES = ["Racing", "Action", "Arcade", "Puzzle", "Adventure", "Sports"] as const;
export type GameGenre = (typeof GAME_GENRES)[number];

export type GameListing = {
  slug: string;
  title: string;
  genre?: GameGenre;
  tagline: string;
  status: GameStatus;
  /** Bare https origin. Null until the game can be framed. */
  origin: string | null;
  poster: string;
  controls: string;
  soonReason: string | null;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const games: GameListing[] = [
  {
    slug: "velocity",
    title: "Velocity",
    genre: "Racing",
    tagline: "Street race at blue hour. Outrun the cops and keep the car.",
    status: "playable",
    origin: "https://racing.worldofz.info",
    poster: "/posters/velocity.jpg",
    controls: "Keyboard or touch",
    soonReason: null,
  },
  {
    slug: "vanguard",
    title: "Vanguard",
    genre: "Action",
    tagline: "A short team match against bots.",
    status: "soon",
    origin: null,
    poster: "/posters/vanguard.jpg",
    controls: "Keyboard, mouse, or touch",
    soonReason: "This game is not a browser game yet.",
  },
  {
    slug: "flap-flap-fly",
    title: "Flap Flap Fly",
    genre: "Adventure",
    tagline: "You are the bird. Flap through a mountain valley, river and ocean, and grow from bird to dragon.",
    status: "playable",
    origin: "https://flap-flap-fly.liveapps.dev",
    poster: "/posters/flap-flap-fly.jpg",
    controls: "Keyboard, or flap with your camera",
    soonReason: null,
  },
];

export function getGame(slug: string): GameListing | undefined {
  return games.find((game) => game.slug === slug);
}

export function genreForGame(game: GameListing): GameGenre {
  return game.genre ?? getGame(game.slug)?.genre ?? "Arcade";
}

/** True only for a bare https origin, with no path, query, port, or login. */
export function isHttpsOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === "" &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

/** Bare origin with a trailing slash, or null when the shelf must not frame it. */
export function playSrc(game: GameListing): string | null {
  if (game.status !== "playable" || game.origin === null || !isHttpsOrigin(game.origin)) {
    return null;
  }
  return new URL(game.origin).toString();
}

/** Same game, with the flag that tells it the hub is the parent. */
export function frameSrc(game: GameListing): string | null {
  const src = playSrc(game);
  if (!src) return null;
  const url = new URL(src);
  url.searchParams.set("hub", "1");
  return url.toString();
}

export function assertCatalog(list: GameListing[]): void {
  const slugs = new Set<string>();
  for (const game of list) {
    if (!SLUG.test(game.slug)) {
      throw new Error(`${game.slug} is not a slug`);
    }
    if (slugs.has(game.slug)) {
      throw new Error(`duplicate slug ${game.slug}`);
    }
    slugs.add(game.slug);
    if (!game.poster.startsWith("/posters/")) {
      throw new Error(`${game.slug} poster must live in /posters`);
    }
    if (game.status === "playable") {
      if (playSrc(game) === null) {
        throw new Error(`${game.slug} is playable without an https origin`);
      }
      if (game.soonReason !== null) {
        throw new Error(`${game.slug} is playable and should not have a soon reason`);
      }
    } else {
      if (game.origin !== null) {
        throw new Error(`${game.slug} is soon but has an origin`);
      }
      if (!game.soonReason) {
        throw new Error(`${game.slug} is soon without a reason`);
      }
    }
  }
}

assertCatalog(games);
