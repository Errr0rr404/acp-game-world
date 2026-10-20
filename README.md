# Game World

A curated library of browser games. Discover a game, save it for later, and jump into play. Each game stays on its own site.

- Featured game, search, genre and availability filters, and title sorting.
- A guest library of favorites and recently played games, stored in this browser and synced between its tabs.
- Game details, keyboard navigation, responsive layouts, and reduced-motion support.
- A game player with fullscreen, controls help, reload, slow-connection recovery, and a link to the game's own site.
- Optional passwordless accounts with recent play history and game results.
- Operator tools for descriptions, genres, artwork, and availability.
- Share Game World or a playable game with native sharing or a copyable public link. Shared links include a social preview card.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
pnpm test
pnpm test:e2e
```

Open http://127.0.0.1:3000.

The public app is https://games.agentcontrolpanel.dev. https://game.agentcontrolpanel.dev is the same site and redirects there. `NEXT_PUBLIC_SITE_URL` controls canonical URLs and share links; it defaults to the public address and is read at build time.

`DATABASE_URL` and `BETTER_AUTH_SECRET` turn on optional accounts. Without `RESEND_API_KEY`, a development server shows the sign-in link on the page instead of emailing it. `APPROVED_ORIGINS` is the only list of sites the shelf is allowed to frame. `OPERATOR_EMAILS` can edit that shelf.

How a new game joins is written in `docs/game-contract.md`.

The design direction and project review are in `docs/project-review.md`.

Favorites are local to a browser and are not synced through accounts. Clearing browser storage removes the local library. If storage is unavailable, the library still works for the current visit. Account history is recorded when a game opens, rather than when its page is rendered or prefetched.

Accounts use MySQL. `DATABASE_URL` is a `mysql://` URL. The public app uses the hub `shared-mysql` database `acp_game_world`. The schema is created on first use, including an optional `genre` column on `game_listing`. Built-in games keep their genres when older rows have no value. Database calls have connection and query timeouts, and discovery falls back to the built-in catalog when the database is unavailable.

Browser tests use a fixture for the embedded game's content and mocked sign-in delivery. Framing permission still follows the game's response headers. Actual database-backed sign-in and email delivery need a configured environment.
