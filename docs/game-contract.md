# Joining Game World

A browser game can join the shelf without being copied into this repo. It stays on its own site.

## What the game must do

- Serve itself on its own `https` address.
- Let people play without an account.
- Send this response header, and no `X-Frame-Options: DENY`:

```
Content-Security-Policy: frame-ancestors https://games.agentcontrolpanel.dev https://game.agentcontrolpanel.dev
```

Local development also needs `http://localhost:3000` and `http://127.0.0.1:3000` in that list.

- Work inside a frame: pointer lock, touch, and sound after a click.
- Not navigate the top window. The hub provides Leave game.
- Stay off the shelf until the operator adds that exact origin to `APPROVED_ORIGINS`.

## Messages

The hub loads the game at `https://the-game.example/?hub=1`.

The hub sends one message after the frame loads:

```ts
{ type: "hub.hello", v: 1, player: { displayName: string } | null }
```

The game may answer:

```ts
{ type: "game.ready", v: 1 }
{ type: "game.result", v: 1, summary: string } // 80 characters or fewer
{ type: "game.exit", v: 1 }
```

Check `event.origin` before trusting `hub.hello`. The hub checks both the game's origin and the sending frame before trusting a message or storing a result. A game that never speaks these messages still plays. The library then only remembers that a player opened it.

Play history starts after the frame opens or sends `game.ready`. Opening or prefetching the hub's play route alone does not record a session. The parent ends the session when the player leaves, including client-side navigation.

## What this repo changes

One catalog row (including its genre), one poster in `public/posters`, and one browser test that the new card opens its own origin. Vanguard is not eligible until it has a deployed browser build.
