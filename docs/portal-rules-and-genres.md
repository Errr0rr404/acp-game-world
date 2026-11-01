# Portal rules on look-alike games, takedown precedent, exclusivity, and 2025–2026 genres

Research date: 2026-10-18. Covers the five games skyline-sprint (3-lane runner), voxel-rivals (voxel multiplayer sandbox), swingline (grapple swing), stunt-ridge (stunt bike) and sly-steps (trap platformer). This is not legal advice.

Portal terms are paraphrased, not quoted at length, so section numbers and URLs are given for checking the exact wording. "Fetched" means the live page as read on 2026-10-18.

## Summary

- Both portals reject clones but accept games in the same genre. What gets a game rejected or removed is a copied name, characters, art, UI, audio or code, not the mechanic.
- Poki also turns away games that are original but too close to a crowded genre or an existing hit. Three of the five reference hits (Subway Surfers, Stickman Hook, Level Devil) are licensed to Poki exclusively, and Poki's lawyers send takedowns for copies of them.
- Poki's web exclusivity rules out hosting the same game on Game World or CrazyGames. Linking from Game World to the Poki page fits Poki's rules. A Game World build on CrazyGames must carry no Game World branding.
- Poki's non-exclusive flat fee is real, but Poki doesn't publish the amount and decides itself whether to offer it. Don't plan revenue around it.
- The fastest-growing themes on both portals in 2025–26 were Roblox-style obby and "brainrot" games. The crowded genres are the voxel sandbox (Bloxd.io dominates) and the 3-lane runner (Subway Surfers on Poki). The genres with room are grapple swing and trap platformer on CrazyGames, plus physics driving, which is crowded but pulls an outsized share of plays.

## 1. Clone and copycat rules

### Poki

Source: Content & player safety, https://developers.poki.com/guide/content-player-safety (fetched 2026-10-18; `sdk.poki.com/poki-quality-guidelines` redirects here).

- **Clones.** "Direct copies and clones are never accepted" because they breach Poki's Terms & Conditions. Games inspired by known genres are welcome if they add something new.
- **The test.** When a game feels close to another title, Poki compares six things:
  - art style
  - core mechanics (copied loop, goals and inputs, versus a unique twist or genre blend)
  - progression and economy
  - UI, icons and audio cues
  - characters (designs, animations, silhouettes)
  - name and thumbnail. A name chosen to ride the original's search terms counts as clone-like.
- **IP misuse.** Misused IP and adult themes mean immediate rejection, and strong test metrics never override this. Templates and asset flips don't count as original.
- **Parody.** Games close to the parody line may be taken down on a legal request, or get less marketing.
- **Crowded genres.** Differentiation matters most in crowded genres. When a genre or trend is oversaturated, Poki may decline further similar games even if they work well. Adding to diversity means a mechanic, setting or angle not already well represented on Poki, not a variation on an existing hit.
- **AI.** Games made solely with AI can raise ownership questions, so be ready to show tools, prompts and process.
- **Promotion.** Clones of existing hits won't be promoted (https://developers.poki.com/guide/what-we-look-for, fetched 2026-10-18).
- **Terms not public.** Poki's legal team drafts a contract after final review (https://developers.poki.com/guide/release-process, fetched 2026-10-18), so its IP warranty and takedown clauses aren't public.
- **Enforcement.** GitHub's public DMCA log holds 58 notices filed for Poki BV between 2024-09-23 and 2026-10-14. All of them claim exclusive web licences, and they target rehosted copies of Poki games. The 2026-01-13 notice names Level Devil, Stickman Hook, Subway Surfers, Temple Run, Retro Bowl and others as exclusively licensed to Poki. GitHub accepted the copyright claims but not the anti-circumvention claim. Sources: https://github.com/github/dmca/blob/master/2026/01/2026-01-13-poki.md (2026-01-13), and a code search of `github/dmca` for "Poki" (2026-10-18).

### CrazyGames

| Source | Rule (paraphrased) |
|---|---|
| FAQ, https://docs.crazygames.com/faq/ (fetched 2026-10-18) | Unoriginal content, such as clones or asset flips, is a listed reason to fail first QA. To earn revenue share, a game must be original and clearly distinguishable from existing games. Updates that breach the terms get the game terminated immediately. |
| Gameplay requirements, https://docs.crazygames.com/requirements/gameplay/ (fetched 2026-10-18) | Mandatory: game names, assets and overall content must show originality. |
| Quality guidelines, https://docs.crazygames.com/requirements/quality/ (fetched 2026-10-18) | Recommended: the name and icon must not be easily confused with another game. Don't use an identifier you don't own; CrazyGames' example is that only the IP holder may use "Scrabble". Name and imagery must match the gameplay. |
| Developer terms, https://files.crazygames.com/documents/developer_terms_20250818.pdf (last updated 2025-08-18) | §4.4(a)(iv): no third-party copyright or trademark material without the owner's written consent. §5.3(d): compensation is due only if the game and its assets stay distinguishable from existing games; an accepted game that fails this earns nothing. §7.1(f)–(h): you warrant ownership, original development and non-infringement. §7.4: you indemnify CrazyGames, which may withhold your earnings to cover claims. §3.5 and §9.3: CrazyGames may remove any game at any time, at its sole discretion, without notice. |
| Takedowns, same PDF §7.2 | CrazyGames forwards a takedown notice to you and invites evidence against it. If you don't answer within a commercially reasonable time, that is an incurable material breach. CrazyGames still decides alone whether to comply. You may cure by getting a licence or by modifying the game so it no longer infringes. |

### Do they reject or delist genre look-alikes?

- **Poki:** yes, by written policy. Poki rejects clones. It may also decline non-clones that feel too derivative or arrive in an oversaturated genre, and it may pull parody-line games on a legal request. I found no public report of Poki delisting a named game purely for genre resemblance.
- **CrazyGames:** clones and asset flips are rejected, but genre look-alikes with their own assets are listed side by side. On 2026-10-18 the Minecraft tag held 85 games: Bloxd.io, Miniblox, CubeRealm.io, Voxiom.io, Kirka.io, Poxel.io and others. The Bike tag held Moto X3M alongside MX Offroad Master, Trial Mania and Xtreme Moto Mayhem (https://www.crazygames.com/t/minecraft, https://www.crazygames.com/t/bike). I found no case of CrazyGames delisting a game for genre resemblance alone. Its §5.3(d) can leave a too-similar game live but unpaid.

## 2. Precedent, 2023–2026

| Case | Platform | Claimed as infringing | Outcome | Source |
|---|---|---|---|---|
| NYT vs Wordle clones (Jan–Mar 2024) | GitHub / web | The Wordle name, the 5×6 grid and the green-tile feedback. The NYT also claimed broader concepts and mechanics. | Reactle and its ~1,900 forks were taken down. The NYT said it has no issue with similar word games that don't infringe its Wordle trademarks or copyrighted gameplay. | 404 Media, https://www.404media.co/nytimes-files-copyright-takedowns-against-hundreds-of-wordle-clones/ (2024-03-07); CBS News, https://www.cbsnews.com/newyork/news/nyt-copyright-takedown-wordle-clones-new-york-times/ (2024-03-13) |
| The Pokémon Company vs "Pocket Monster: Remake" (ruling 2024-07-12) | Mobile, China | Copyright in the Pokémon games, including characters such as Pikachu and Ash, plus unfair competition | ¥107M (about $15M) in damages from the Shenzhen Intermediate People's Court; two defendants appealed | https://corporate.pokemon.co.jp/media/news/detail/345.html (2024-09-13); PocketGamer.biz, https://www.pocketgamer.biz/the-pokmon-company-wins-15-million-in-lawsuit-over-copyright-infringement/ (2024-09-18) |
| Sony vs Tencent, *Light of Motiram* (filed Jul 2025) | PC / mobile | Described by Sony as a slavish clone of Horizon: copyright plus trademark, so similar that players could take it for a Horizon game | Confidential settlement, dismissed with prejudice; the game was removed from Steam and Epic | VGC, https://www.videogameschronicle.com/news/tencent-horizon-clone-pulled-from-stores-as-sony-settles-lawsuit (2025-12-18) |
| Nexon vs Ironmace, *Dark and Darker* | PC, Korea | Trade secrets: source code, graphics and internal data taken from a Nexon project | ₩5.7B (about $3.8M), upheld by the Supreme Court. Copyright infringement was **rejected** because the genres differ (battle royale versus extraction). | Korea JoongAng Daily, https://www.koreajoongangdaily.com/business/supreme-court-rules-in-favor-of-nexon-orders-dark-and-darker-developer-to-pay-38-million/12580996 (2026-04-30) |
| Nintendo/Pokémon vs Pocketpair, *Palworld* (filed 2024, Japan) | PC / console | **Patents** on monster-capture and summon mechanics | Pocketpair patched out the Pal Sphere summon. The claim now covers only old, Japan-only versions, and reported exposure is at most about ¥5M. | VGC, https://www.videogameschronicle.com/news/palworld-lawsuit-nears-end-with-nintendo-reportedly-poised-to-gain-almost-nothing/ (2026-06-13) |
| Poki vs rehosted copies (2024–2026) | Web / GitHub | Exact copies of HTML5 code and graphics: Stickman Hook, Subway Surfers, Level Devil, Retro Bowl, Monkey Mart | The repositories were removed | GitHub DMCA log (see §1) |

**What made them infringing:**

- the name, or a confusingly similar one: Wordle, and Light of Motiram's alleged confusion with Horizon
- characters and their designs: Pikachu and Ash
- distinctive presentation: Wordle's grid and tile colours
- copied code or assets: Dark and Darker, and the Poki rehosts
- rarely, a patented mechanic: Palworld, and only in Japan

**What was safe:**

- Genre and mechanics alone. The Korean courts rejected Nexon's copyright claim over a shared genre, and the NYT itself said similar word games are fine.
- Both portals list many same-genre games side by side.

**Caveat:** a takedown needs no court ruling. The Reactle developer deleted the project rather than fight it. CrazyGames §7.2 makes silence on a takedown a breach of contract, so keep design records ready.

## 3. Exclusivity versus Game World and CrazyGames

**What Poki's exclusive deal covers:**

- **Scope.** Under a web-exclusive deal, the game is on Poki only, on the open web. You can't publish it on other web portals or aggregators. Discord and YouTube Playables count as web. Steam, app stores and consoles stay yours. Sources: https://developers.poki.com/guide/revenue-deal-types and https://developers.poki.com/guide/working-with-poki (both fetched 2026-10-18).
- **Term.** The default term is 5 years, described as indicative and set per contract. The September 2025 version of the page said 7 years (Wayback, http://web.archive.org/web/20250915034741/https://sdk.poki.com/deals.html).

**Game World:**

- **Hosting.** Game World is a multi-game web hub, so hosting or iframing a Poki-exclusive game there conflicts with the ban on other web portals or aggregators. So does listing that game on CrazyGames.
- **Linking.** A link from Game World to the game's Poki page fits Poki's model. Poki pays 100% of revenue for players who come directly, including through your own community, and splits 50/50 for players Poki brings (working-with-poki page, fetched 2026-10-18). Confirm in the contract that Game World referrals are attributed this way.
- **Carve-outs.** Poki has agreed to one before. Tall Team's Obby Roads launched exclusively on Poki alongside the version already on its own site, obbyroads.io (https://poki.com/blog/tall-teams-launches-obby-roads-poki, 2025-12-10). That was a single-game studio site, though, not a portal like Game World. Ask for a carve-out, but don't assume one.

**CrazyGames:**

- **Non-exclusive by default** (§3.1, terms of 2025-08-18). Being on Game World and CrazyGames at the same time is fine.
- **Timed exclusivity option.** It adds 50% compensation for 2 months if CrazyGames hosts the game, and it covers every browser gaming website (§5.5). Game World would have to wait those 2 months.
- **Build rules.** The CrazyGames build must carry no branding of another browser game portal (§5.3(a)) and no cross-promotion. Community links are allowed only if they don't lead to a playable web version (gameplay requirements page).
- **Hosting.** CrazyGames won't iframe games hosted by competing portals (FAQ), so upload the files to CrazyGames rather than pointing at Game World.

**Poki's non-exclusive flat fee:**

- Poki offers it for games already on other web platforms, or with a niche or short-term fit. It pays no revenue share and comes with no marketing investment (revenue-deal-types page, fetched 2026-10-18).
- No amount is published. The only data points I found:
  - a 2020 forum post reporting an offer of as little as $500 (https://html5gamedevs.com/topic/45717-someone-knows-pokicom, 2020-06-30)
  - a third-party guide giving generic portal flat fees of a few hundred to $5,000+, with no Poki-specific figure (https://www.abratabia.com/web-game-monetization/licensing-to-portals.php, updated June 2026)
- The game still has to pass Poki's curation and oversaturation rules. **Verdict:** possible upside for a game that's already a hit elsewhere, but not a channel to plan around.

## 4. Breakout genres, 2025–2026

### Poki

- **2025 review** (https://poki.com/blog/2025-at-poki-a-year-in-review, 2025-12-03):
  - 227 new releases
  - top performers: Plonky (GameTornado) and SnapStyle Dress Up (PlayCap)
  - SYBO added Subway Surfers Blast and Match
- **Car games report** (https://poki.com/blog/game-intelligence-car-games, 2026-09-29):
  - car games are 10% of US plays
  - platform-style car games are 7% of car titles but take 30% of car plays
  - Drive Mad alone takes 23.2% of car plays and earned over $1M in 12 months
  - Blacktop Police Chase (Feb 2025, 4.5M plays) is the fastest-growing new title
  - Poki exclusives hold 4 of the top 5
- **Obby genre:** Obby Roads launched exclusively by the Smash Karts studio (2025-12-10, link above).
- **Live pages** (fetched 2026-10-18):
  - Homepage top row: Subway Surfers, MineFun.io, Drift Boss, Retro Bowl, Stickman Hook, Monkey Mart, Level Devil and others.
  - New **Brainrot** category with 43 games, led by Steal a Brainrot, Brainrot Craft and Make Brainrots Online (https://poki.com/en/brainrot).
  - **Obby** category (https://poki.com/en/obby).
  - The New list is heavy on dress-up, merge, pets and simulators (https://poki.com/en/new).
- **Portrait:** portrait mode is winning on mobile web (https://poki.com/blog/building-web-browser-games-2026, 2026-06-05).

### CrazyGames

I found no official 2025 year-in-review post; the developer blog didn't render for fetching. The figures below are from live tag pages fetched 2026-10-18, as plays and release year.

- **Obby (87 games):** most of the top 15 were released in 2025–2026, for example Obby World: Squid Escape (16.7M, 2025), Meeland.io (16.0M, 2025) and Escape Tsunami for Brainrots! (13.3M, 2026). The homepage has a "Meme & bloxy" intent mixing Bloxd.io, Growden.io and brainrot games (https://www.crazygames.com/t/obby, https://www.crazygames.com/t/meme-bloxy).
- **Difficult:** Space Waves (240.6M, 2024) is the breakout (https://www.crazygames.com/t/difficult).
- **Minecraft / Block (85 games):** Bloxd.io at 483.7M plays is about 10× the next, Miniblox (42.9M, 2024). Newer entries include Poxel.io (21.5M, 2025) and 99 Nights (bloxd.io) (17.0M, 2025).
- **Bike (62) and Dirt Bike (18):** Traffic Rider (68.5M, 2025), Moto X3M (54.7M) plus four sequels in the top 15, Sky Riders (46.5M) and MX Offroad Master (35.0M).
- **Running (107):** Count Masters (65.5M, 2025) and Man Runner 2048 (50.3M). New 2026 entries are obby or "steal" hybrids. Subway Surfers isn't listed.
- **Swing:** there is no swing or grapple tag. The only grapple game in the Platform tag's top 20 is Grapple Rush (2026, about 57K plays) (https://www.crazygames.com/t/platform).
- **Roblox context:** the obby, brainrot and "steal a…" themes come from Roblox, where Steal a Brainrot peaked at 25.4M concurrent players (PocketGamer.biz, https://www.pocketgamer.biz/robloxs-steal-a-brainrot-becomes-first-game-to-surpass-25m-concurrent-players, Oct 2025).

### Crowded or room

| Genre (game) | Poki | CrazyGames |
|---|---|---|
| 3-lane runner (skyline-sprint) | **Crowded and partner-owned.** Subway Surfers is pinned on the homepage, and SYBO's partnership grew in Nov 2025. Temple Run and Talking Tom Gold Run are listed too. | Moderate. There's no Subway Surfers; crowd-runners lead. |
| Voxel MP sandbox (voxel-rivals) | Crowded: MineFun.io is pinned | **Most crowded.** Bloxd.io is winner-take-most. |
| Grapple swing (swingline) | Stickman Hook is a pinned Poki exclusive | **Room.** I found almost no grapple games. |
| Stunt bike (stunt-ridge) | Crowded, but high demand: physics-platform driving takes 30% of car plays. Moto X3M isn't Poki-exclusive. | Crowded: Moto X3M series, Traffic Rider |
| Trap platformer (sly-steps) | Level Devil is a pinned Poki exclusive | **Room.** "Difficult" is led by Space Waves, not trap platformers. |

## Recommendations

1. **Lead with CrazyGames plus Game World for skyline-sprint, swingline and sly-steps.** Poki holds exclusive licences to the hits they resemble and sends takedowns for copies of them. Its oversaturation rule makes rejection likely, and a Poki exclusive would block both other channels. Submit to Poki only if one of them shows a clear twist with strong numbers.
2. **Make stunt-ridge the Poki candidate.** Physics driving earns outsized plays there, and its reference hit isn't a Poki exclusive. If Poki offers an exclusive, keep the game off CrazyGames, show it on Game World only as a link to its Poki page, and ask for an own-site carve-out like Obby Roads got.
3. **Audit each game against Poki's six dimensions before submitting.**
   - Name and thumbnail must not echo "Subway", "Hook", "X3M", "Devil", "-craft" or "blox".
   - Characters, silhouettes, UI layout, colours and audio cues must be your own.
   - voxel-rivals must not use Minecraft textures, fonts or mobs; Mojang counts confusingly similar names and distinctive textures as its brand (https://www.minecraft.net/en-us/usage-guidelines, fetched 2026-10-18).
4. **Give each game one mechanic its reference hit lacks.** Poki's diversity bar names a mechanic, setting or angle, not a reskin. Examples:
   - swingline: races against other players' ghosts
   - sly-steps: player-made trap levels
   - skyline-sprint: a non-lane movement rule
5. **Narrow voxel-rivals to a short, round-based multiplayer mode** for CrazyGames. Its "With friends" and "Meme & bloxy" placements reward that, while a general sandbox competes head-on with Bloxd.io. An obby or brainrot-flavoured mode fits what broke out on both portals in 2025–26.
6. **Keep Game World out of the portal builds.** Strip Game World branding and links from every CrazyGames build (§5.3(a), no cross-promotion), and upload files to CrazyGames rather than iframing from Game World. Skip CrazyGames' 2-month exclusivity bonus for any game you want on Game World at launch.
7. **Keep a dated design log for each game** (concept notes, asset sources, commit history). A CrazyGames takedown notice must be answered quickly, or it becomes a contract breach (§7.2). Poki asks AI-heavy games for their process on request.
8. **Plan portrait-first mobile layouts** for the runner and the trap platformer (Poki, 2026-06-05). Don't plan revenue around Poki's non-exclusive fee.

## Gaps

- Poki's developer contract isn't public, so its IP warranty and takedown clauses are unknown.
- I found no CrazyGames 2025 year-in-review post.
- I didn't search patents for runner, swing, bike or platformer mechanics.
- Play counts are CrazyGames' displayed lifetime totals, not 2025–26 figures.
