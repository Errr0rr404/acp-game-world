"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { genreForGame, playSrc, type GameListing } from "@/games/catalog";
import { filterGames, type GameFilters } from "@/games/library";
import { useLibrary } from "@/games/use-library";
import { GameCard } from "./GameCard";
import { GameDetails } from "./GameDetails";
import { Icon } from "./Icon";
import { SaveGameButton } from "./SaveGameButton";
import { ShareLinkButton } from "./ShareLinkButton";
import { publicUrl } from "@/site";

export function GameShelf({ games, mode = "discover" }: { games: GameListing[]; mode?: "discover" | "library" }) {
  const library = useLibrary();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [status, setStatus] = useState<GameFilters["status"]>("all");
  const [collection, setCollection] = useState<"saved" | "recent">("saved");
  const [sort, setSort] = useState("featured");
  const [details, setDetails] = useState<GameListing | null>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const isLibrary = mode === "library";
  const featured = games.find((game) => playSrc(game));
  const recent = library.recent.map((item) => games.find((game) => game.slug === item.slug)).find((game) => game && playSrc(game));
  const collectionSlugs = collection === "saved" ? library.saved : library.recent.map((item) => item.slug);
  const source = isLibrary ? collectionSlugs.flatMap((slug) => games.filter((game) => game.slug === slug)) : games;
  const filtered = filterGames(source, { query, genre, status });
  const visible = sort === "title" ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : filtered;
  const genres = [...new Set(games.map(genreForGame))].sort();
  const playableCount = source.filter((game) => playSrc(game)).length;
  const hasFilters = Boolean(query.trim() || genre !== "all" || status !== "all");

  function resetFilters() { setQuery(""); setGenre("all"); setStatus("all"); }
  function openDetails(game: GameListing, trigger: HTMLButtonElement) {
    detailTrigger.current = trigger;
    setDetails(game);
  }
  function closeDetails() {
    setDetails(null);
    detailTrigger.current?.focus();
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <h1>{isLibrary ? "Your library" : "A good day to play."}</h1>
          <p>{isLibrary ? "Your favorites and recent games, all in one place." : "Little escapes. Big adventures. All in your browser."}</p>
        </div>
        <div className="intro-actions">
          <span className="guest-note"><Icon name={isLibrary ? "library" : "gamepad"} />{isLibrary ? "Saved in this browser" : "Jump in. No account needed."}</span>
          {!isLibrary ? <ShareLinkButton title="Game World" text="A good day to play. Free browser games, no account needed." url={publicUrl()} label="Share Game World" /> : null}
        </div>
      </div>

      {!isLibrary && featured ? (
        <section className="featured-game" aria-labelledby="featured-title">
          <Image src={featured.poster} alt="" fill preload sizes="(min-width: 1280px) 1216px, 100vw" className="featured-art" />
          <div className="featured-content">
            <div className="featured-tags"><span className="spotlight-label">In the spotlight</span><span>{genreForGame(featured)}</span></div>
            <h2 id="featured-title">{featured.title}</h2>
            <p>{featured.tagline}</p>
            <div className="featured-actions">
              <Link href={`/play/${featured.slug}`} className="button button-primary button-large"><Icon name="play" />Play {featured.title}</Link>
              <SaveGameButton game={featured} />
            </div>
            <span className="featured-controls"><Icon name="keyboard" />{featured.controls}<span className="status-dot" />Free to play</span>
          </div>
          <span className="featured-caption">Your next escape starts here.</span>
        </section>
      ) : null}

      {!isLibrary && recent ? (
        <div className="continue-strip">
          <Icon name="clock" /><p>Back for another round? <strong>{recent.title}</strong> is ready.</p>
          <Link href={`/play/${recent.slug}`} className="button button-quiet">Play again<Icon name="arrow" /></Link>
        </div>
      ) : null}

      <section id="games" className="shelf-section" aria-labelledby="shelf-heading">
        <div className="section-heading">
          <div><h2 id="shelf-heading">{isLibrary ? "Make it your own." : "Find your next favorite."}</h2><p>{isLibrary ? "Save a game with the heart. Come back whenever you like." : "A small collection, with more worlds on the way."}</p></div>
          {isLibrary ? <Link href="/" className="button button-secondary">Discover games<Icon name="arrow" /></Link> : <span className="collection-count">{games.length} {games.length === 1 ? "game" : "games"} to discover</span>}
        </div>

        {isLibrary ? (
          <div className="collection-switch" role="group" aria-label="Your collections">
            <button type="button" aria-pressed={collection === "saved"} onClick={() => setCollection("saved")}><Icon name="heart" />Saved games<span>{games.filter((game) => library.saved.includes(game.slug)).length}</span></button>
            <button type="button" aria-pressed={collection === "recent"} onClick={() => setCollection("recent")}><Icon name="clock" />Recently played<span>{games.filter((game) => library.recent.some((item) => item.slug === game.slug)).length}</span></button>
          </div>
        ) : null}

        <div className="shelf-tools">
          <div className="search-field">
            <Icon name="search" />
            <input type="search" aria-label="Search games" placeholder="Search for your next escape…" value={query} onChange={(event) => setQuery(event.target.value)} />
            {query ? <button type="button" className="icon-button" aria-label="Clear search" onClick={() => setQuery("")}><Icon name="close" /></button> : null}
          </div>
          <label className="select-field"><span className="sr-only">Genre</span><select aria-label="Genre" value={genre} onChange={(event) => setGenre(event.target.value)}><option value="all">All genres</option>{genres.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="select-field sort-field"><span className="sr-only">Sort games</span><select aria-label="Sort games" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">{isLibrary ? "Your order" : "Featured first"}</option><option value="title">Title: A–Z</option></select></label>
        </div>

        <div className="filter-row">
          <div className="availability-filters" role="group" aria-label="Game availability">
            {([{ value: "all", label: "All games", count: source.length }, { value: "playable", label: "Play now", count: playableCount }, { value: "soon", label: "Coming soon", count: source.length - playableCount }] as const).map((filter) => (
              <button key={filter.value} type="button" aria-pressed={status === filter.value} onClick={() => setStatus(filter.value)}>{filter.label}<span>{filter.count}</span></button>
            ))}
          </div>
          <span className="result-count" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? "game" : "games"}{hasFilters ? " found" : ""}</span>
        </div>

        {visible.length ? (
          <ul className="game-grid">{visible.map((game) => <GameCard key={game.slug} game={game} onDetails={openDetails} />)}</ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><Icon name={hasFilters ? "search" : collection === "saved" ? "heart" : "gamepad"} /></span>
            <h3>{hasFilters ? "No games match just yet." : collection === "saved" ? "Keep your favorites close." : "Your next adventure is waiting."}</h3>
            <p>{hasFilters ? "Try another search or give a different genre a go." : collection === "saved" ? "Tap the heart on any game to add it to your library. No sign-in needed." : "Play a game and you’ll find it here for your next visit."}</p>
            {hasFilters ? <button type="button" className="button button-primary" onClick={resetFilters}>Clear filters</button> : <Link href="/" className="button button-primary">Discover games<Icon name="arrow" /></Link>}
          </div>
        )}
        {isLibrary ? <p className="library-note"><Icon name="info" />This library stays in this browser. <Link href="/me">View your account play history</Link> for games you opened while signed in.</p> : null}
      </section>
      {details ? <GameDetails game={details} onClose={closeDetails} /> : null}
    </>
  );
}
