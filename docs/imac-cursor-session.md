# iMac Cursor session

This file is the pickup note for the Cursor CLI session that is finishing the 20 browser games Claude Code left unfinished. The session runs on the iMac, not in whatever chat is open on this Mac.

Closing a chat here does not stop that session. A later agent should SSH to the iMac, read the transcript, and report what finished. Do not start a second session while screen `acp-game-world` is still running.

## Where it runs

- Host: `zan-imac.local` (`192.168.12.248`). The machine calls itself `Zan-iMac.lan`. That name does not resolve from this MacBook.
- SSH user: `zann`
- Platform copy on the iMac: `/Users/zann/acp-game-world`
- Game folders on the iMac: `/Users/zann/game-*` (siblings of the platform, not inside it)
- This checkout is a different working tree. Do not treat local files as the iMac's files.

## The live session

Started 2026-10-20 07:27 EDT. Claude Opus is reviewing all 42 `game-*` folders. It fixes bugs and worthwhile visual, play, or performance problems, then commits and pushes that game. Beatline is first because a stopped Grok review left uncommitted edits there.

- Screen session: `claude-game-review` (detached). Reattach with `screen -r claude-game-review`.
- Log: `/Users/zann/.cursor/handoffs/claude-review.log`
- Status: `/Users/zann/.cursor/handoffs/claude-review-status.json`
- Runner: `/Users/zann/.cursor/handoffs/run-claude-review.py`
- Model: `opus`, effort `high`.
- Chrome: `shot.mjs` takes `/tmp/gw-chrome.lock` and uses software rendering (`--use-angle=swiftshader`), not Metal. One browser only. The runner may start a second Claude for code review when the load is low and no Chrome is open. It does not start a second one while Chrome is running or the load is high.
- Do not start another browser session, game build, or review while this screen is running.

The Grok screen `grok-game-review` was stopped. Amber Drop and Balloon Bastion were already pushed. The earlier build screen `acp-game-world` had finished all 22 batch games. This review pushes game repos only. It does not redeploy Coolify.

Check it:

```bash
ssh -4 zann@192.168.12.248 'screen -ls; ps -ax -o pid,etime,command | grep "[c]laude-review"'
```

If the screen is gone, read `claude-review.log` and `claude-review-status.json` before starting anything new. The hostname `zan-imac.local` can hang on IPv6. Use the IPv4 address.

## Deploy notes

When a game is pushed and its Chrome check has passed, the iMac writes `/Users/zann/.cursor/handoffs/deploy-ready/<slug>.json`. This Mac deploys that game on Coolify (`coolify.agentcontrolpanel.dev`, Game World project) at `https://<slug>.liveapps.dev`, then connects it on https://games.agentcontrolpanel.dev/. One game at a time. Do not start a second deploy while one is still building.

On 2026-10-19 the finished games were deployed to `https://<slug>.liveapps.dev` and connected on the shelf. The shelf's main address is https://games.agentcontrolpanel.dev. https://game.agentcontrolpanel.dev is the same site.

## What Claude left

Claude Code session `ebef576d` in `/Users/zann/acp-game-world`. Transcript:

`/Users/zann/.claude/projects/-Users-zann-acp-game-world/ebef576d-2324-429f-9365-bd41023406b5.jsonl`

Subagents:

`/Users/zann/.claude/projects/-Users-zann-acp-game-world/ebef576d-2324-429f-9365-bd41023406b5/subagents/`

Claude was building 20 original browser games, one folder each, then private repos under GitHub org `Five-Boroughs-Labs-FBL`, then shelf rows in this platform. The session died while those agents were still running. GitHub CLI on the iMac is signed in as `Errr0rr404`. New game repos should be private, matching `game-stunt-ridge` and the other existing `game-*` repos. Shelf rules are `docs/game-contract.md` and `src/games/catalog.ts`.

| Game | Folder | Claude subagent marked finished | Git when handed off |
|---|---|---|---|
| Stackfall | `game-stackfall` | no | repo, 0 commits |
| Orchard Drop | `game-orchard-drop` | no | repo, 0 commits |
| Twofold | `game-twofold` | no | no git |
| Ember & Tide | `game-ember-and-tide` | no | no git |
| Rim Rivals | `game-rim-rivals` | no | no git |
| Crumb Tycoon | `game-crumb-tycoon` | no | 1 commit on main |
| Corner Pocket | `game-corner-pocket` | no | no git |
| Beatline | `game-beatline` | no | no git |
| Balloon Bastion | `game-balloon-bastion` | no | no git |
| Sinkhole | `game-sinkhole` | no | no git |
| Lab Escape | `game-lab-escape` | yes | 1 commit on main |
| Bubble Reef | `game-bubble-reef` | no | no git |
| Wordwell | `game-wordwell` | yes | 1 commit on main |
| Patience Parlor | `game-patience-parlor` | no | no git |
| Glowtail | `game-glowtail` | no | no git |
| Monster Haul | `game-monster-haul` | no | no git |
| Hop Lanes | `game-hop-lanes` | no | no git |
| Lantern Horde | `game-lantern-horde` | no | no git |
| Inkland | `game-inkland` | no | no git |
| Sweet Snip | `game-sweet-snip` | yes | 1 commit on main |

A finished flag only means Claude's subagent returned. Those three still needed a private GitHub repo, a push, and a shelf entry. None of this batch was on GitHub at handoff.
