# Game World platform design

How Game World grows from a curated shelf of 28 framed games into a publishing platform that ships thousands of games to millions of players — what changes, what stays, and in what order.

## Scaling review of the current hub

Games run on their own sites inside an iframe, so game traffic never reaches this server. Many people playing different games at once is mostly fine. Three things in the hub itself will hurt under load:

1. **Every page view writes to the database.** `loadGames()` (`src/db/index.ts:162-178`) upserts all built-in games into `game_listing` with `INSERT … ON DUPLICATE KEY UPDATE` on every call. It runs on every view of the home page, library, history and play pages, and again on every session start (`src/app/api/sessions/route.ts:13`). Concurrent multi-row upserts on the same rows cause InnoDB lock waits and deadlocks. When one fails, the `catch` silently falls back to the built-in list, hiding operator edits and database-only games.
   Fix: seed once alongside `ensureSchema`, and cache catalog reads with a short TTL that is invalidated when an operator saves.
2. **Every play page fetches the game's own site.** `readFramePermission` (`src/games/frame.ts:61`) does a `no-store` GET to the game's homepage on every play-page render, with an 8 second timeout, and the page waits for it. Many players means one server IP hammering each game host; a host that rate-limits it shows "unreachable" to players.
   Fix: cache the result per origin for a minute or so.
3. **The database pool is small and writes have no deadline.** The pool has 5 connections per process (`src/db/index.ts:17`), and requests queue for a connection with no limit on how long they wait. `max_execution_time` (line 29) only applies to read-only `SELECT`s in MySQL, so inserts, updates and the upsert above have no timeout.

Smaller items:

- `getSession()` reads the session from the database on every request; better-auth's cookie cache is not enabled.
- `/api/sign-in` has no rate limit of its own, so it can be used to flood someone's inbox. better-auth's built-in limiter counts in memory, separately per server process.
- `generateMetadata` on the play page reads the built-in catalog rather than the database, so a game added by an operator gets the generic "Game" title in link previews.
- `play_session` gains a row every time a game opens and is never pruned. The index on it is fine for now.

## Where it stands

Today Game World is a Next.js storefront that frames games living on their own sites. That is the right core idea: the hub never serves game traffic, so a hit game costs the hub almost nothing. What holds it back is that every game is hand-wired.

**Keep**

- Games run in a sandboxed cross-origin iframe; the hub only shows the shelf and the player chrome.
- A versioned `postMessage` contract (`hub.hello`, `game.ready`, `game.result`, `game.exit`) with origin and source-window checks.
- Guest-first play: favorites and recents live in the browser, accounts are optional.
- Player chrome that already handles slow loads, refusals, fullscreen and reload.

**What breaks at hundreds of games**

| Today | Why it stops working |
| --- | --- |
| Each game is a row in `src/games/catalog.ts`, a poster in `public/posters`, an entry in `APPROVED_ORIGINS` and a browser test. | Adding a game is a code change and a redeploy. That caps the catalog at what engineers have time to merge. |
| Each game is deployed by its developer to its own domain. | No control over uptime, versioning, size or what the game does; an origin can change underneath a live listing. |
| Every page view upserts the whole catalog into MySQL, then reads it back. | Write load grows with traffic, not with catalog changes; row locks and deadlocks under concurrency. |
| Every play page fetches the game's homepage server-side to read its framing headers. | One fetch per player per game, from one IP, uncached. |
| The full catalog is sent to the browser and filtered there. | Fine for 28 games; slow and heavy at 5,000. |
| A play session is a MySQL row written on open, result and exit. | Analytics and history share the account database; no way to rank games by real play. |
| One genre per game, six genres, title sort. | Discovery needs tags, collections, trending, new, and personalization. |

## Goals

"CrazyGames on steroids" means three things: games ship without engineers, players reach a game faster than anywhere else, and the platform learns what to show each player. The targets below are proposed design numbers, not measurements — the team should confirm them.

| Goal | Proposed target |
| --- | --- |
| Catalog size the design must handle | 10,000 live games without architectural change |
| Time from developer upload to live | Under 24 hours, with automated checks done in minutes |
| Engineer involvement to publish a game | None — publishing is a portal and a review queue |
| Concurrent players | 100,000 across all games; game bytes never pass through app servers |
| Click on a card to first frame of the game | Under 2 seconds on a fast connection (p75) |
| Shelf pages | Served from the edge cache; p75 time to first byte under 200 ms |
| Hub availability | 99.9%; a database outage still lets guests browse and play |

**Non-goals for now:** a native app, a downloadable launcher, and hosting real-time multiplayer servers for games (games bring their own, or use a later relay service).

## Architecture at a glance

Game files never touch the app servers; pages come from the edge cache.

```text
Player's browser
  [ Storefront page: shelves, search, game pages, player chrome ] <-> [ Game frame: separate domain, sandboxed, SDK ]
        | pages              | API calls              | play events             | game files
        v                    v                        v                         v
  [ Edge cache ]       [ Platform API ]         [ Event ingest ]          [ Game CDN ]
        | on a miss          |                        |                         | on a miss
        v                    v                        v                         v
  [ Storefront app ]   [ Key-value store ]      [ Analytics store ]       [ Object storage ]
        |       \                                     | daily stats             ^ approved build
        v        \------------> [ Search index ] <----/                   [ Review pipeline ]
  [ Catalog database ]                                                          ^ new build
                                                                          [ Developer portal ]
```

Four paths leave the player's browser, and each scales on its own. **Pages** come from the edge cache and only reach the storefront app on a miss. **API calls** (sign-in, saves, scores, likes) go to a small platform API backed by a key-value store and the catalog database. **Play events** go to an ingest endpoint that queues them for the analytics store, whose daily stats feed search ranking and the catalog. **Game files** come straight from the game CDN, filled from object storage by the review pipeline — the heaviest traffic never reaches an app server. The storefront app also reads the catalog and the search index, and the review pipeline registers each released build in the catalog.

## Publishing pipeline

The biggest change: **Game World hosts game builds itself** instead of framing each developer's own site. Developers upload a build; the platform serves it from its own game CDN. This is how large portals work, and it removes the per-game allowlist, the per-play header fetch and the risk of an origin changing under a live listing.

**Hosting model**

- Every build is an immutable, content-addressed bundle at `https://<game-slug>.<games-domain>/<build-id>/`. The games domain is separate from the storefront domain, so games can never read storefront cookies or storage.
- One subdomain per game keeps games isolated from each other (separate origins, separate storage, separate permissions).
- Builds are cached at the CDN edge forever; "publishing" a new version is a pointer change in the catalog, and rollback is moving the pointer back.
- Today's externally hosted games keep working as **linked games** — the current framing path stays as a second, smaller lane, with header checks cached per origin instead of per play.

**From upload to live**

1. **Developer portal.** A developer signs in, creates a game, and uploads a zip (or connects a Git/CI step that pushes builds by API).
2. **Automated checks (minutes).** Unpack in a sandbox; enforce size limits; scan for malware and known-bad scripts; load the build in a headless browser inside the real player frame; confirm it reaches `game.ready` (or first paint) within a time budget; record load time, memory, console errors and network calls; take screenshots and a short gameplay video for the listing.
3. **Policy checks.** No top-window navigation, no external ad scripts outside the SDK, no account walls before play, content rating questionnaire answered.
4. **Human review queue.** A reviewer sees the automated report, screenshots and video, plays briefly, and approves, rejects with reasons, or asks for changes.
5. **Staged release.** Approved builds go live to a small share of traffic first (or to a "new games" lane), then to everyone if load errors and early-exit rates stay normal.
6. **Updates.** New builds of a live game skip full human review unless automated checks flag a regression; every update is versioned and instantly reversible.

**Listing metadata** (title, description, tags, controls, cover art in required sizes, orientation, mobile support, age rating) is edited in the portal, versioned, and reviewed with the build. Cover art is uploaded once and resized into every format the storefront needs by an image service — no more posters committed to the repo.

## Game SDK

The current `postMessage` contract is the seed of the SDK. Version 2 ships as a small JavaScript package (plus Unity, Godot and Construct wrappers) that games include. Under the hood it is still messages between the game frame and the player page, so the game never gets storefront cookies or tokens.

| Area | Calls | Why |
| --- | --- | --- |
| Lifecycle | `loadingStart`, `loadingProgress(pct)`, `ready`, `gameplayStart`, `gameplayStop`, `exit` | Accurate load times, pausing on ads and tab switches, and real play-time numbers for ranking. Replaces `game.ready` / `game.exit`. |
| Player | `getPlayer()` → display name, avatar, signed-in or guest | Replaces `hub.hello`. No email or ids are ever sent to a game. |
| Saves | `save(key, data)`, `load(key)` | Cloud saves for signed-in players, local saves for guests, merged on sign-in. Size-limited per game. |
| Scores and results | `submitScore(board, value)`, `result(summary)` | Leaderboards and the existing short result line, validated and rate-limited server-side. |
| Achievements | `unlock(id)` | Defined in the portal; shown on the player's profile. |
| Ads | `requestAd("midgame" or "rewarded")` → started, finished, skipped, unavailable | The platform owns ad placement; games only ask at natural breaks. |
| Social | `invite(roomCode)`, `share()` | Invite links that open the game with a code, for games with their own multiplayer. |
| Events | `track(name, props)` | Custom funnel events, sampled and capped. |

**Contract rules**

- Versioned (`v: 2`) and additive. v1 games keep working; the player page speaks both.
- Every call has a timeout and a defined "unavailable" answer, so a game never hangs because a service is down.
- The player page, not the game, talks to platform APIs. It enforces per-game quotas (save size, score submissions per minute, events per session).
- Scores from the browser are untrusted. Boards show plausibility-checked scores; games that need cheat resistance can submit signed results from their own server.
- A local SDK simulator lets developers test every call without uploading.

## Catalog and discovery

**Data model.** The catalog moves out of code into the database, edited through the portal and an internal admin tool.

- `game` — slug, developer, status (draft, in review, live, paused, removed), current build, age rating, orientation, device support.
- `game_build` — immutable build id, storage path, size, check report, created and released times.
- `game_listing_version` — title, description, controls, art, per locale; the live listing is a pointer, so edits can be reviewed and rolled back.
- `tag` and `game_tag` — many tags per game (genre, mechanic, theme, input, "2 player", "io"), replacing the single six-value genre.
- `collection` — hand-curated or rule-based lists ("Racing games for phones", "New this week") with their own landing pages.
- `game_stats_daily` — plays, unique players, median play time, early-exit rate, rating, written by the analytics pipeline, never by page views.

**Search.** A dedicated search index (Typesense, Meilisearch or Algolia) holds one document per live game: title, tags, description, popularity and quality signals. It gives typo-tolerant search-as-you-type, tag facets and sorting without touching the main database. The index is updated when a listing changes and when daily stats land.

**Pages.** Every game gets its own server-rendered page (`/game/<slug>`) with description, screenshots, controls, related games and structured data, and every tag and collection gets a landing page. These pages are the main source of search-engine traffic, so they must be fast and indexable. Shelves paginate or load in pages from the server; the browser never receives the full catalog.

**Ranking.** Each shelf row is a ranked query, not a hand-sorted list:

- **Trending** — plays in the last 24 hours, weighted by play time, divided by an age factor.
- **Top rated** — likes over plays, with a minimum-play threshold so a new game with three likes doesn't win.
- **New** — newly released games get a guaranteed exposure budget; the ones that keep players move up, the rest settle.
- **For you** — later phase: games similar to what this player played longest, from tag overlap first, then co-play data.
- Quality signals (load failures, early exits, crash reports) demote a game automatically and alert the developer.

**Players' own library.** Favorites and recents stay guest-first, but sync to the account when the player signs in (today they never sync), and continue-playing works on any device.

## Scale and reliability

The rule: **reads come from caches, writes go to queues, and game bytes never touch app servers.**

**Traffic shape.** Almost all requests are reads of the same few hundred shelf, tag and game pages, plus game assets. Writes are small and bursty: play events, saves, scores, likes.

| Layer | Design | Replaces |
| --- | --- | --- |
| Game assets | Object storage behind a CDN; immutable build URLs cached at the edge with long lifetimes. | Each developer's own hosting. |
| Storefront pages | Rendered on the server, cached at the edge for 30–60 seconds, purged by tag when a listing or collection changes. Signed-in bits (avatar, "continue playing") load separately so pages stay cacheable. | Fully dynamic pages that read MySQL on every view. |
| Catalog reads | Read from an in-memory cache refreshed on change; database read replicas behind it. | The whole-catalog upsert on every request. |
| Search | The search index, never the database. | Client-side filtering of the full catalog. |
| Play events | Browser → a lightweight ingest endpoint → a queue → an analytics store (ClickHouse, BigQuery or similar). Batched, sampled if needed, dropped rather than slowing the game. | A MySQL row per play session. |
| Account data | The relational database (managed MySQL or Postgres) with a connection pooler, read replicas, and timeouts on every query — writes included. | One 5-connection pool with no write timeouts. |
| Saves and scores | Key-value store (Redis, DynamoDB or similar) for hot data; leaderboards as sorted sets; durable copy in the database. | — |
| Sessions | Signed session cookies verified without a database round trip, refreshed periodically. | A database read on every request. |
| Rate limits | A shared store (Redis) at the edge or API gateway, so limits hold across all servers. | In-memory limits per server. |

**Degrade, don't fail.** If the database is down, shelves serve from cache and guests keep playing; account features say they are unavailable. If analytics is down, events are dropped. If the ad service is slow, the game starts without the ad. Each dependency has a timeout and a fallback, and the player page never waits on more than one network call before showing the game.

**Operations.** Infrastructure as code; preview deploys per pull request; synthetic checks that open a sample of live games every few minutes; dashboards for load success rate and time-to-first-frame per game; alerts when a game's load failures spike, routed to its developer as well as on-call.

## Monetization and trust

**Ads.** The platform owns every ad. The player page shows ads around the game (a pre-roll before first play, display units on game pages) and inside it only when the game asks through the SDK (`midgame` at natural breaks, `rewarded` when the player opts in for a reward). Rules:

- Frequency caps per player per hour, and no ad before a returning player's first play of a session if they played recently.
- The game is paused and muted while an ad plays; an ad that fails or is blocked returns "unavailable" and the game continues.
- Ad requests go through one server-side waterfall or header-bidding setup so demand partners can change without touching games.
- Ad load time and its effect on early exits are tracked per game; ads that drive players away are reduced.

**Developer payouts.** Ad revenue is attributed to the game where the ad played, reported daily in the portal, and paid on a revenue share. The share rate, payout threshold and any exclusivity bonus are business decisions (see Open decisions).

**Privacy and young players.** A large share of web-game players are children, so this is part of the design, not a later add-on.

- A consent manager for regions that require one, with ads falling back to non-personalized when consent is missing.
- Players under 13, or of unknown age, get contextual ads only, no profiling, and no free-text chat or public profiles. Accounts keep today's age confirmation, extended with a parental flow if under-13 accounts are ever allowed.
- Games receive only a display name and avatar, never email or account ids.

**Moderation and safety.**

- Every build and listing passes review; listings carry an age rating; each game page has a report button that feeds the review queue.
- A game can be paused instantly (the pointer is removed from every shelf and its build stops serving) by an admin or automatically on a malware or abuse signal.
- Display names and any user text go through a filter; leaderboards hide names that fail it.
- Games run in a sandboxed frame on a separate domain with only the permissions they declare (camera, microphone, gamepad, pointer lock), approved at review.

## Storefront design system

The current look — midnight surfaces, lilac and mint accents, Space Grotesk headings, Atkinson Hyperlegible body, artwork as the hero — is a good base. At thousands of games the job shifts from showcasing one featured game to letting players scan hundreds of covers fast. The system formalizes today's CSS variables in `src/app/globals.css` into tokens and a small component set that every page is built from.

**Tokens**

| Group | Tokens | Notes |
| --- | --- | --- |
| Color | `bg`, `surface`, `surface-raised`, `border`, `text`, `text-muted`, `accent`, `accent-2`, `success`, `warning`, `danger`, `focus` | Today's palette mapped onto these names. Every text pair meets WCAG AA contrast. Dark is the default; add a light theme only if research asks for it. |
| Type | `display`, `title-l`, `title-m`, `title-s`, `body`, `body-s`, `label`, `caption` | Fluid sizes with `clamp()`; tile titles are one line, ellipsized. |
| Space | 4-pixel scale: 4, 8, 12, 16, 24, 32, 48, 64 | Grid gutters 12 on phones, 16 on desktop. |
| Radius | `sm` 6, `md` 10, `lg` 16, `pill` | Tiles use `md`; chips use `pill`. |
| Motion | `fast` 120 ms, `base` 200 ms, `slow` 320 ms, one easing curve | Everything off under reduced motion. |
| Elevation | `raised`, `overlay` | Surfaces and borders, not heavy shadows. |

**Components**

- **Game tile** — the core unit. Cover art at a fixed 16:9 ratio, title, optional badge (New, Updated, Hot, Mobile). On hover or focus, a muted 3–5 second gameplay preview from the automated check video. Sizes: small (dense grids), medium (shelf rows), large (heroes). Always a link to the game page, with a play shortcut.
- **Shelf row** — a titled, horizontally scrolling row of tiles with a "See all" link to its tag or collection page. The home page is a stack of ranked rows: Continue playing, Trending, New, For you, then tag rows.
- **Category rail** — a collapsible side rail on desktop and a top chip scroller on phones listing tags and collections, so every part of the catalog is two clicks from anywhere.
- **Search** — a global search box with instant results (tiles plus matching tags) from the search index.
- **Game page** — player on top, then title, rating, tags, controls, description, screenshots, and related rows. The player stays the existing play shell, extended with like/dislike, report, and theater and fullscreen modes.
- **Hero** — one or a few promoted games with large art; editorial, not ranked.
- **Chips, buttons, inputs, dialogs, toasts, empty and error states** — the existing ones, cleaned up and documented.

**Art specs for developers.** Cover 1920×1080 (16:9) and 800×1200 (2:3), safe area for the title, no baked-in ratings or "play now" text. The image service creates WebP/AVIF sizes from those.

**Budgets.** A shelf page under 150 KB of JavaScript, the first row of tiles in the initial HTML, cover images lazy-loaded below the fold, and gameplay previews loaded only on hover.

**Where it lives.** One `tokens` file and a `components/ui` folder in this repo, with a living gallery page (or Storybook) showing every component and state. The developer portal uses the same tokens.

## Roadmap

Each phase ships on its own, and a gate opens the next. Phases are ordered, not dated — the team should size them.

```text
Phase 0: Fix the hub --[load test passes]--> Phase 1: Foundations --[own games on CDN]--> Phase 2: Invited developers --[review and payouts work]--> Phase 3: Open platform
```

1. **Phase 0, fix the hub (this repo, now).** Stop upserting the catalog on every request; cache catalog reads and invalidate on operator save; cache framing-header checks per origin; add timeouts to writes; pull today's CSS variables into a tokens file. Gate: a load test of the play flow passes without database errors.
2. **Phase 1, foundations.** Move the catalog into the database with an admin tool; stand up object storage and the game CDN and move our own studio's games onto it; ship SDK v2 (lifecycle, player, saves) while keeping v1; add game and tag pages, tags, and the search index; sync guest libraries to accounts. Gate: our own games run from the CDN.
3. **Phase 2, invited developers.** Developer portal, automated build checks, review queue and staged releases; ads through the SDK; the analytics pipeline and ranked shelves; per-game revenue reporting. Gate: review and payouts work end to end for outside developers.
4. **Phase 3, open platform.** Open submissions, payouts, leaderboards and achievements, personalized rows, localization, and multi-region serving.

## Open decisions

| Decision | Options | Recommendation |
| --- | --- | --- |
| Hosting | Host builds ourselves, or keep framing developers' sites | Host builds; keep framing as a small "linked games" lane for partners. |
| Where the games come from | Our own studio only, invited developers, or open submissions | Own studio plus invited developers first; open submissions once review tooling and payouts work. |
| Cloud provider and CDN | Stay on Coolify plus a CDN in front, or move to a managed cloud | Put a CDN and object storage in front now; move app servers when traffic needs autoscaling. |
| Database | Stay on the shared MySQL, or a managed database of our own | Own managed database with replicas before the open-submissions phase. |
| Search | Self-hosted Typesense or Meilisearch, or hosted Algolia | Self-hosted Typesense or Meilisearch; cheaper at this size and easy to swap. |
| Analytics store | ClickHouse, BigQuery, or a product analytics tool | ClickHouse or BigQuery for raw events; a product tool on top if wanted. |
| Revenue share | Rate, payout threshold, exclusivity bonus | Business call; needed before inviting outside developers. |
| Accounts | Keep magic links only, or add Google and Apple sign-in | Add Google sign-in; magic links stay as the fallback. |
| Under-13 players | Guest-only, or parental-consent accounts | Guest-only for now, with contextual ads. |
