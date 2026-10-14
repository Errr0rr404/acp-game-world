# Game World improvement pass

The app is a curated browser game library. Its primary job is to get a visitor into a real game quickly, and help them find it again later. Velocity is playable; Vanguard is upcoming. The design must reflect those facts without inventing titles, ratings, or player counts.

## Design direction

- Midnight `#101426`, panel `#191f36`, white `#f4f6ff`, muted blue `#acb5d0`, lilac `#b8a5ff`, and mint `#91e4c3`.
- Space Grotesk for headings and Atkinson Hyperlegible for body text. Large game titles, short readable descriptions, sentence case controls.
- A quiet navigation bar, a featured game with its existing illustration, then a searchable two-column library. Mobile uses one column. Game artwork is the memorable element; surrounding controls stay restrained.
- Save and recent-play features work without an account. Account history is a separate, optional benefit.

```text
Game World       Discover / Your library         Account
Welcome
[ Featured game description / Play ] [ Existing artwork ]
All games                         Search / Genre / Status
[ Game artwork + details + save ] [ Upcoming game ]
```

The original heavy outlines and repeated offset shadows compete with the artwork. This pass replaces them with a consistent hierarchy of surfaces and borders, and keeps decorative gradients confined to making overlaid text readable.

## Review priorities

- Discovery: add search, genre and availability filters, saved games, recent games, and meaningful empty states.
- Player: distinguish a slow load from a refusal, handle the ready message, add retry and fullscreen, and reject messages from other windows.
- Sessions: avoid overwriting simultaneous result/end updates; end sessions on client navigation as well as page exit.
- Accounts: recover cleanly from authentication/database errors and clearly explain validation, success, and unavailable accounts.
- Persistence: tolerate corrupt or unavailable local storage; retry schema initialization after a transient database failure; bound account history queries.
- Accessibility: keyboard navigation, visible focus, dialog focus management, reduced motion, responsive layouts, and status announcements.
- Verification: existing unit coverage plus focused checks for new persistence/filter logic and browser flows with deterministic game-frame fixtures.

## Completed review

| Priority | Original issue | Result |
| --- | --- | --- |
| P1 | Rendering a play page created a database session before the game opened. | The player starts history through an authenticated POST only after the frame opens or reports ready. |
| P1 | A four-second timer treated slow loads as blocked games. | A twelve-second slow state offers waiting, reload, and the game's own site; late loads can still succeed. |
| P1 | Result and end requests could overwrite one another's fields. | Session updates change only supplied fields, enforce ownership in SQL, and preserve an existing end time. |
| P1 | Game messages checked origin but not the sending window. | Only the currently mounted iframe can send a trusted ready, result, or exit message. |
| P2 | Failed schema initialization was cached permanently and database calls had no deadlines. | Initialization can retry; connection and query calls have timeouts. Account failures leave guest discovery usable. |
| P2 | Single-use sign-in gates used a separate read and delete. | Atomic delete-and-return prevents two consumers from using the same gate. |
| P2 | Account history read every past session. | Recent history is bounded to 200 sessions and displays the latest session per game. |
| P2 | Navigation, forms, empty states, and game availability lacked clear guidance. | Every main screen has a consistent design, explicit actions, useful feedback, and a route back to games. |

Discovery now includes search across titles, descriptions, controls, and genres; availability filters; title sorting; and game details. The new guest library includes favorites, recently played games, cross-tab updates, and a quick return to the latest playable game. Corrupt storage is ignored, and unavailable storage falls back to memory for the visit.

The player now includes fullscreen, controls help, reload, accessible loading states, and a fallback to the game's own site. Session ending covers browser exit and client navigation. Sign-in has focused field validation, pending feedback, a clear inbox confirmation, and a truthful development-link state. Operator tools include genre, field limits, fixed slugs for existing games, and save feedback.

## Verification

- 25 unit tests passed.
- 21 browser/API tests passed, covering real request validation, fullscreen, native dialog dismissal and focus restoration, library persistence, cross-tab changes, unavailable storage, native sharing, share cancellation, copy fallbacks, and social-preview metadata.
- ESLint and the production build (including TypeScript) passed.
- Desktop at 1440px, tablet at 768px, and phone layouts at 390px and 320px were checked. Screenshots were reviewed for desktop, phone, and sign-in.

The preview and production build used accounts disabled to avoid writing to the configured database. Sign-in email responses and embedded game content were mocked in browser tests. The framing check still reads the actual game's headers, and unit tests separately cover blocked and unavailable responses. Live account creation, email delivery, operator database writes, and the automatic genre migration were not exercised against the configured database.

## Sharing and release

The public share CTA is “Share Game World.” It opens the device's share menu when supported, otherwise copies the canonical public URL. If clipboard access is denied, the link is selected for manual copying. Canceling a native share does not copy anything. Playable game details can share a direct play URL. Private query parameters and local development addresses are excluded.

The site has canonical URLs, Open Graph/Twitter metadata, and a generated 1200 × 630 social preview using the existing Velocity artwork. The build-time `NEXT_PUBLIC_SITE_URL` defaults to `https://game.agentcontrolpanel.dev`.

Production is the `game-world` application in Coolify context `spider-hub`, linked to this repository's `main` branch. Auto-deploy is enabled. Releases must be verified against their exact commit and on the public site.
