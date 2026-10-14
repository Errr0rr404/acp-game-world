# Game World

A shelf for browser games. Each game stays on its own site.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
pnpm test
pnpm test:e2e
```

Open http://127.0.0.1:3000.

`DATABASE_URL` and `BETTER_AUTH_SECRET` turn on optional accounts. Without `RESEND_API_KEY`, a development server shows the sign-in link on the page instead of emailing it. `APPROVED_ORIGINS` is the only list of sites the shelf is allowed to frame. `OPERATOR_EMAILS` can edit that shelf.

How a new game joins is written in `docs/game-contract.md`.
