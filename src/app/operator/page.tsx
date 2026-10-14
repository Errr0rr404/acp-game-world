import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/Icon";
import { loadGames } from "@/db";
import { approvedOrigins, isOperator } from "@/games/policy";
import { GAME_GENRES, genreForGame, type GameListing } from "@/games/catalog";

export const metadata: Metadata = { title: "Manage games" };
type EditorQuery = { error?: string; saved?: string };

export default function OperatorPage({ searchParams }: { searchParams: Promise<EditorQuery> }) {
  return <><SiteHeader /><main id="main-content" className="page-shell"><Suspense fallback={<p className="shelf-loading" role="status">Opening the game tools…</p>}><Editor searchParams={searchParams} /></Suspense></main><SiteFooter /></>;
}

async function Editor({ searchParams }: { searchParams: Promise<EditorQuery> }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!isOperator(session.user.email)) redirect("/");
  const query = await searchParams;
  const games = await loadGames();
  return <>
    <div className="operator-intro"><h1>Manage games</h1><p>Keep the library up to date. Playable games must use an approved address and have a browser version ready to open.</p></div>
    <details className="notice"><summary>Approved game addresses</summary><p style={{ marginTop: 10, overflowWrap: "anywhere" }}>{approvedOrigins().join(", ")}</p></details>
    {query.error ? <p role="alert" className="notice notice-error" style={{ marginTop: 18 }}>{query.error}</p> : null}
    {query.saved ? <p role="status" className="notice notice-success" style={{ marginTop: 18 }}>Saved {query.saved}.</p> : null}
    <div className="operator-list">{games.map((game) => <ListingForm key={game.slug} game={game} />)}<ListingForm /></div>
  </>;
}

function ListingForm({ game }: { game?: GameListing }) {
  return <form action="/api/operator" method="post" className="listing-form">
    <h2>{game ? game.title : "Add a new game"}</h2>
    <div className="listing-fields">
      <label className="form-field">Title<input className="form-input" name="title" defaultValue={game?.title ?? ""} maxLength={80} required /></label>
      <label className="form-field">Slug<input className="form-input" name="slug" defaultValue={game?.slug ?? ""} maxLength={64} required readOnly={Boolean(game)} pattern="[a-z0-9]+(-[a-z0-9]+)*" aria-describedby={game ? undefined : "slug-help"} />{!game ? <span id="slug-help" className="small-note">Used in the game address, e.g. midnight-racer.</span> : null}</label>
      <label className="form-field">Description<input className="form-input" name="tagline" defaultValue={game?.tagline ?? ""} maxLength={240} required /></label>
      <label className="form-field">Controls<input className="form-input" name="controls" defaultValue={game?.controls ?? ""} maxLength={120} required placeholder="Keyboard or touch" /></label>
      <label className="form-field">Genre<select className="form-input" name="genre" defaultValue={game ? genreForGame(game) : "Arcade"}>{GAME_GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select></label>
      <label className="form-field">Availability<select className="form-input" name="status" defaultValue={game?.status ?? "soon"}><option value="playable">Ready to play</option><option value="soon">Coming soon</option></select></label>
      <label className="form-field">Poster path<input className="form-input" name="poster" defaultValue={game?.poster ?? "/posters/"} maxLength={120} required placeholder="/posters/my-game.jpg" /></label>
      <label className="form-field">Game address<input className="form-input" type="url" name="origin" defaultValue={game?.origin ?? ""} maxLength={253} placeholder="https://game.example.com" /></label>
      <label className="form-field">Message for an upcoming game<input className="form-input" name="soonReason" defaultValue={game?.soonReason ?? ""} maxLength={240} placeholder="The browser version is in the works." /></label>
    </div>
    <button type="submit" className="button button-primary"><Icon name="check" />{game ? "Save changes" : "Add game"}</button>
  </form>;
}
