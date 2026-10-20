export type GameStatus = "playable" | "soon";
export const GAME_GENRES = ["Racing", "Action", "Arcade", "Puzzle", "Adventure", "Sports"] as const;
export type GameGenre = (typeof GAME_GENRES)[number];

/** Who a game is a good first pick for. This is a shelf grouping, not an age gate. */
export const AUDIENCES = ["kids", "everyone", "older"] as const;
export type GameAudience = (typeof AUDIENCES)[number];

export const AUDIENCE_LABEL: Record<GameAudience, string> = {
  kids: "For kids",
  everyone: "For everyone",
  older: "A little older",
};

const KIDS = new Set([
  "flap-flap-fly", "sweet-snip", "orchard-drop", "crumb-tycoon", "hop-lanes", "bubble-reef",
  "flock-fling", "sugarlink", "ring-drop", "spring-roof", "glowtail", "balloon-bastion",
  "tetherfly", "sundial-dash", "marble-hall", "beatline", "mothlight", "ribbon",
  "amber-drop", "color-shed", "tile-garden", "twofold",
]);

const OLDER = new Set(["scrapyard-fps", "night-barrage", "lantern-horde"]);

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
    title: "Street Racer",
    genre: "Racing",
    tagline: "The city is yours. Street races, flying cars, and open roads.",
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
    status: "playable",
    origin: "https://wordwell.liveapps.dev",
    poster: "/posters/wordwell.jpg",
    controls: "Keyboard, mouse or touch",
    soonReason: null,
  },
  {
    slug: "sweet-snip",
    title: "Sweet Snip",
    genre: "Puzzle",
    tagline: "Snip the twine, swing the candy into Mallow, and collect three stars along the way.",
    status: "playable",
    origin: "https://sweet-snip.liveapps.dev",
    poster: "/posters/sweet-snip.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
  {
    slug: "lab-escape",
    title: "Lab Escape",
    genre: "Arcade",
    tagline: "Hold to thrust out of Sublevel 9, grabbing coins and dodging the lab's traps.",
    status: "playable",
    origin: "https://lab-escape.liveapps.dev",
    poster: "/posters/lab-escape.jpg",
    controls: "Hold Space, click, or touch",
    soonReason: null,
  },
  {
    slug: "monster-haul",
    title: "Monster Haul",
    genre: "Racing",
    tagline: "Gas and brake only. Get the monster truck to the flag across thirty original stages.",
    status: "playable",
    origin: "https://monster-haul.liveapps.dev",
    poster: "/posters/monster-haul.jpg",
    controls: "Keyboard or touch",
    soonReason: null,
  },
  {
    slug: "balloon-bastion",
    title: "Balloon Bastion",
    genre: "Action",
    tagline: "Pop layered balloons with a crew of critter defenders across three maps.",
    status: "playable",
    origin: "https://balloon-bastion.liveapps.dev",
    poster: "/posters/balloon-bastion.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
  {
    slug: "inkland",
    title: "Inkland",
    genre: "Arcade",
    tagline: "Paint a line, close the loop, and claim the paper before rival painters cut you.",
    status: "playable",
    origin: "https://inkland.liveapps.dev",
    poster: "/posters/inkland.jpg",
    controls: "Mouse, keyboard, or touch",
    soonReason: null,
  },
  {
    slug: "corner-pocket",
    title: "Corner Pocket",
    genre: "Sports",
    tagline: "3D eight-ball with spin, called pockets, and a computer opponent.",
    status: "playable",
    origin: "https://corner-pocket.liveapps.dev",
    poster: "/posters/corner-pocket.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
  {
    slug: "patience-parlor",
    title: "Patience Parlor",
    genre: "Puzzle",
    tagline: "Three solitaire tables on one felt: Klondike, Spider, and FreeCell, with undo, hints, and a daily deal.",
    status: "playable",
    origin: "https://patience-parlor.liveapps.dev",
    poster: "/posters/patience-parlor.jpg",
    controls: "Mouse, keyboard, or touch",
    soonReason: null,
  },
  {
    slug: "glowtail",
    title: "Glowtail",
    genre: "Arcade",
    tagline: "Swallow drifting light, grow a glowing eel, and coil around AI rivals.",
    status: "playable",
    origin: "https://glowtail.liveapps.dev",
    poster: "/posters/glowtail.jpg",
    controls: "Mouse, keyboard, or touch",
    soonReason: null,
  },
  {
    slug: "twofold",
    title: "Twofold",
    genre: "Puzzle",
    tagline: "Slide. Fold equal tiles together. Chase the gems.",
    status: "playable",
    origin: "https://twofold.liveapps.dev",
    poster: "/posters/twofold.jpg",
    controls: "Arrows, WASD, swipe, or drag",
    soonReason: null,
  },
  {
    slug: "beatline",
    title: "Beatline",
    genre: "Arcade",
    tagline: "A neon one-button rhythm runner. Jump, fly and flip through five synthwave tracks.",
    status: "playable",
    origin: "https://beatline.liveapps.dev",
    poster: "/posters/beatline.jpg",
    controls: "Keyboard or touch",
    soonReason: null,
  },
  {
    slug: "rim-rivals",
    title: "Rim Rivals",
    genre: "Sports",
    tagline: "1v1 sunset rooftop basketball: time the release, catch fire, and climb six rivals.",
    status: "playable",
    origin: "https://rim-rivals.liveapps.dev",
    poster: "/posters/rim-rivals.jpg",
    controls: "Keyboard or touch",
    soonReason: null,
  },
  {
    slug: "bubble-reef",
    title: "Bubble Reef",
    genre: "Puzzle",
    tagline: "Aim the clam cannon, match 3 pearls and send whole reefs tumbling.",
    status: "playable",
    origin: "https://bubble-reef.liveapps.dev",
    poster: "/posters/bubble-reef.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
  {
    slug: "hop-lanes",
    title: "Hop Lanes",
    genre: "Arcade",
    tagline: "Hop endless roads, rivers, and rails as a voxel critter before the hawk swoops in.",
    status: "playable",
    origin: "https://hop-lanes.liveapps.dev",
    poster: "/posters/hop-lanes.jpg",
    controls: "Keyboard or touch",
    soonReason: null,
  },
  {
    slug: "orchard-drop",
    title: "Orchard Drop",
    genre: "Puzzle",
    tagline: "Drop fruit into a sunny crate and merge two of a kind before the pile spills over.",
    status: "playable",
    origin: "https://orchard-drop.liveapps.dev",
    poster: "/posters/orchard-drop.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
  {
    slug: "crumb-tycoon",
    title: "Crumb Tycoon",
    genre: "Arcade",
    tagline: "Tap a giant pastry, hire bakers, and stack crumbs into an empire.",
    status: "playable",
    origin: "https://crumb-tycoon.liveapps.dev",
    poster: "/posters/crumb-tycoon.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
  {
    slug: "lantern-horde",
    title: "Lantern Horde",
    genre: "Action",
    tagline: "Hold back a swelling night-horde in a lantern-lit forest until dawn.",
    status: "playable",
    origin: "https://lantern-horde.liveapps.dev",
    poster: "/posters/lantern-horde.jpg",
    controls: "WASD or arrows, or drag. Weapons fire on their own.",
    soonReason: null,
  },
  {
    slug: "sinkhole",
    title: "Sinkhole",
    genre: "Arcade",
    tagline: "Slide a hole through a low-poly city, swallow what fits, and outgrow seven rival holes.",
    status: "playable",
    origin: "https://sinkhole.liveapps.dev",
    poster: "/posters/sinkhole.jpg",
    controls: "WASD, arrows, or drag",
    soonReason: null,
  },
  {
    slug: "stackfall",
    title: "Stackfall",
    genre: "Puzzle",
    tagline: "Drop glassy blocks with hold, ghost, and preview in Marathon, Sprint, and Blitz.",
    status: "playable",
    origin: "https://stackfall.liveapps.dev",
    poster: "/posters/stackfall.jpg",
    controls: "Arrows, Z/X, Space, C/Shift, or touch",
    soonReason: null,
  },
  {
    slug: "ember-and-tide",
    title: "Ember & Tide",
    genre: "Puzzle",
    tagline: "Guide Ember and Tide through a sunken temple. Lava, water, poison, and both doors.",
    status: "playable",
    origin: "https://ember-and-tide.liveapps.dev",
    poster: "/posters/ember-and-tide.jpg",
    controls: "Arrows and WASD, or touch pads",
    soonReason: null,
  },
  {
    slug: "ribbon",
    title: "Ribbon",
    genre: "Arcade",
    tagline: "Weave a silk ribbon across the loom, eat spools, and never cross your own thread.",
    status: "playable",
    origin: "https://ribbon.liveapps.dev",
    poster: "/posters/ribbon.jpg",
    controls: "Arrows, WASD, or swipe",
    soonReason: null,
  },
{
    slug: "kiln-break",
    title: "Kiln Break",
    genre: "Arcade",
    tagline: "Slide the peel, bounce the ember, and fire five shelves of clay tiles.",
    status: "playable",
    origin: "https://kiln-break.liveapps.dev",
    poster: "/posters/kiln-break.jpg",
    controls: "Mouse, touch, or arrows",
    soonReason: null,
  },
{
    slug: "flag-camp",
    title: "Flag Camp",
    genre: "Puzzle",
    tagline: "Flag the ember pockets, read the numbers, and clear every safe square.",
    status: "playable",
    origin: "https://flag-camp.liveapps.dev",
    poster: "/posters/flag-camp.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "lattice",
    title: "Lattice",
    genre: "Puzzle",
    tagline: "Fill each row, column, and block. Notes stay small, and wrong ink turns red.",
    status: "playable",
    origin: "https://lattice.liveapps.dev",
    poster: "/posters/lattice.jpg",
    controls: "Keyboard, mouse, or touch",
    soonReason: null,
  },
{
    slug: "amber-drop",
    title: "Amber Drop",
    genre: "Puzzle",
    tagline: "Drop amber or pine and line four, against a friend or the keeper.",
    status: "playable",
    origin: "https://amber-drop.liveapps.dev",
    poster: "/posters/amber-drop.jpg",
    controls: "Click, tap, or keys 1 to 7",
    soonReason: null,
  },
{
    slug: "disc-court",
    title: "Disc Court",
    genre: "Puzzle",
    tagline: "Bracket a line of discs and flip them. Pass if you have no move.",
    status: "playable",
    origin: "https://disc-court.liveapps.dev",
    poster: "/posters/disc-court.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "crown-lane",
    title: "Crown Lane",
    genre: "Puzzle",
    tagline: "Jump when you can. Crown a piece on the far rank and clear the lane.",
    status: "playable",
    origin: "https://crown-lane.liveapps.dev",
    poster: "/posters/crown-lane.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "color-shed",
    title: "Color Shed",
    genre: "Puzzle",
    tagline: "Match a suit or a rank, draw when you cannot, and empty your hand.",
    status: "playable",
    origin: "https://color-shed.liveapps.dev",
    poster: "/posters/color-shed.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "fog-grid",
    title: "Fog Grid",
    genre: "Puzzle",
    tagline: "Place five hulls, then trade shots through the fog until a fleet is gone.",
    status: "playable",
    origin: "https://fog-grid.liveapps.dev",
    poster: "/posters/fog-grid.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "tile-garden",
    title: "Tile Garden",
    genre: "Puzzle",
    tagline: "Lift free matching tiles from a layered bed until the garden is clear.",
    status: "playable",
    origin: "https://tile-garden.liveapps.dev",
    poster: "/posters/tile-garden.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "sugarlink",
    title: "Sugarlink",
    genre: "Puzzle",
    tagline: "Swap neighboring sweets, clear lines of three, and beat five move limits.",
    status: "playable",
    origin: "https://sugarlink.liveapps.dev",
    poster: "/posters/sugarlink.jpg",
    controls: "Mouse, touch, or keyboard",
    soonReason: null,
  },
{
    slug: "mothlight",
    title: "Mothlight",
    genre: "Arcade",
    tagline: "Gather the maze lights, dodge the bats, and turn the chase with a power light.",
    status: "playable",
    origin: "https://mothlight.liveapps.dev",
    poster: "/posters/mothlight.jpg",
    controls: "Arrows, WASD, or swipe",
    soonReason: null,
  },
{
    slug: "night-barrage",
    title: "Night Barrage",
    genre: "Action",
    tagline: "Move and shoot while a cinder formation steps down through the night.",
    status: "playable",
    origin: "https://night-barrage.liveapps.dev",
    poster: "/posters/night-barrage.jpg",
    controls: "Arrows or drag, Space to shoot",
    soonReason: null,
  },
{
    slug: "marble-hall",
    title: "Marble Hall",
    genre: "Arcade",
    tagline: "Charge the plunger, work two flippers, and keep the marble off the drain.",
    status: "playable",
    origin: "https://marble-hall.liveapps.dev",
    poster: "/posters/marble-hall.jpg",
    controls: "Flippers and a plunger, or touch",
    soonReason: null,
  },
{
    slug: "flock-fling",
    title: "Flock Fling",
    genre: "Arcade",
    tagline: "Pull the sling, fling the bird, and knock the bells off four twig towers.",
    status: "playable",
    origin: "https://flock-fling.liveapps.dev",
    poster: "/posters/flock-fling.jpg",
    controls: "Drag the sling, or arrows and Space",
    soonReason: null,
  },
{
    slug: "spring-roof",
    title: "Spring Roof",
    genre: "Arcade",
    tagline: "Bounce a copper spring up the night roofs and steer clear of the kites.",
    status: "playable",
    origin: "https://spring-roof.liveapps.dev",
    poster: "/posters/spring-roof.jpg",
    controls: "Arrows, tilt, or hold a side",
    soonReason: null,
  },
{
    slug: "glass-run",
    title: "Glass Run",
    genre: "Racing",
    tagline: "Steer a marble down a floating glass ribbon before it slips off the edge.",
    status: "playable",
    origin: "https://glass-run.liveapps.dev",
    poster: "/posters/glass-run.jpg",
    controls: "Arrows, tilt, or hold a side",
    soonReason: null,
  },
{
    slug: "ring-drop",
    title: "Ring Drop",
    genre: "Arcade",
    tagline: "Drop a clay bead through spinning hoops and tap to thread each gap.",
    status: "playable",
    origin: "https://ring-drop.liveapps.dev",
    poster: "/posters/ring-drop.jpg",
    controls: "Tap or Space to reverse",
    soonReason: null,
  },
{
    slug: "putt-yard",
    title: "Putt Yard",
    genre: "Sports",
    tagline: "Aim and set power across nine lawn holes, and keep the stroke card honest.",
    status: "playable",
    origin: "https://putt-yard.liveapps.dev",
    poster: "/posters/putt-yard.jpg",
    controls: "Drag to putt, or arrows and Space",
    soonReason: null,
  },
{
    slug: "keylane",
    title: "Keylane",
    genre: "Racing",
    tagline: "Type the night signs to move your cart, and reach the banner with fewer misses.",
    status: "playable",
    origin: "https://keylane.liveapps.dev",
    poster: "/posters/keylane.jpg",
    controls: "Type, or tap the letters",
    soonReason: null,
  },
  {
    slug: "cinder-grid",
    title: "Cinder Grid",
    genre: "Action",
    tagline: "Place a cinder bomb, clear the crates, and be the last figure in the kiln.",
    status: "playable",
    origin: "https://cinder-grid.liveapps.dev",
    poster: "/posters/cinder-grid.jpg",
    controls: "WASD and Space, or arrows and Enter",
    soonReason: null,
  },
  {
    slug: "march-court",
    title: "March Court",
    genre: "Puzzle",
    tagline: "Move the full court, with check, mate, castling, and en passant.",
    status: "playable",
    origin: "https://march-court.liveapps.dev",
    poster: "/posters/march-court.jpg",
    controls: "Click or tap a piece, then a square",
    soonReason: null,
  }
];

export function getGame(slug: string): GameListing | undefined {
  return games.find((game) => game.slug === slug);
}

export function genreForGame(game: GameListing): GameGenre {
  return game.genre ?? getGame(game.slug)?.genre ?? "Arcade";
}

export function audienceForGame(game: { slug: string }): GameAudience {
  if (KIDS.has(game.slug)) return "kids";
  if (OLDER.has(game.slug)) return "older";
  return "everyone";
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
