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
  {
    slug: "scrapyard-fps",
    title: "Scrapyard",
    genre: "Action",
    tagline: "Five against five in a scrapyard. Team deathmatch with bots or friends.",
    status: "playable",
    origin: "https://scrapyard-fps.liveapps.dev",
    poster: "/posters/scrapyard-fps.jpg",
    controls: "Keyboard and mouse, or a controller",
    soonReason: null,
  },
  {
    slug: "sundial-dash",
    title: "Sundial Dash",
    genre: "Arcade",
    tagline: "Run one city through one day. Jump, roll and dodge trams from noon to dawn, faster every lap.",
    status: "playable",
    origin: "https://sundial-dash.liveapps.dev",
    poster: "/posters/sundial-dash.jpg",
    controls: "Keyboard or swipe",
    soonReason: null,
  },
  {
    slug: "voxel-rivals",
    title: "Voxel Rivals",
    genre: "Adventure",
    tagline: "Build a block world with up to 16 players, or race a parkour course in the sky.",
    status: "playable",
    origin: "https://voxel-rivals.liveapps.dev",
    poster: "/posters/voxel-rivals.jpg",
    controls: "Keyboard and mouse, or touch",
    soonReason: null,
  },
  {
    slug: "tetherfly",
    title: "Tetherfly",
    genre: "Arcade",
    tagline: "Hold to hook, let go to fly. Swing through 30 levels to the golden ring.",
    status: "playable",
    origin: "https://tetherfly.liveapps.dev",
    poster: "/posters/tetherfly.jpg",
    controls: "One button: hold, then let go",
    soonReason: null,
  },
  {
    slug: "stunt-ridge",
    title: "Stunt Ridge",
    genre: "Racing",
    tagline: "Ride a dirt bike over trap-filled cliffs. Land flips to beat the clock and your own ghost.",
    status: "playable",
    origin: "https://stunt-ridge.liveapps.dev",
    poster: "/posters/stunt-ridge.jpg",
    controls: "Keyboard, touch or a controller",
    soonReason: null,
  },
  {
    slug: "wicks-end",
    title: "Wick's End",
    genre: "Puzzle",
    tagline: "A small candle in rooms that lie. Floors drop, doors run off, and each death shows you the trap.",
    status: "playable",
    origin: "https://wicks-end.liveapps.dev",
    poster: "/posters/wicks-end.jpg",
    controls: "Keyboard, touch or a controller",
    soonReason: null,
  },
  {
    slug: "wordwell",
    title: "Wordwell",
    genre: "Puzzle",
    tagline: "Five letters, six tries, one word a day. Flip warm tiles, keep your streak and share your grid.",
    status: "soon",
    origin: null,
    poster: "/posters/wordwell.jpg",
    controls: "Keyboard, mouse or touch",
    soonReason: "The browser version is packaged and waiting to go live.",
  },
  {
    slug: "sweet-snip",
    title: "Sweet Snip",
    genre: "Puzzle",
    tagline: "Snip the twine, swing the candy into Mallow, and collect three stars along the way.",
    status: "soon",
    origin: null,
    poster: "/posters/sweet-snip.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: "The browser version is packaged and waiting to go live.",
  },
  {
    slug: "lab-escape",
    title: "Lab Escape",
    genre: "Arcade",
    tagline: "Hold to thrust out of Sublevel 9, grabbing coins and dodging the lab's traps.",
    status: "soon",
    origin: null,
    poster: "/posters/lab-escape.jpg",
    controls: "Hold Space, click, or touch",
    soonReason: "The browser version is packaged and waiting to go live.",
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
