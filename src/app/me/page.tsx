import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/Icon";
import { loadGames, playsForUser } from "@/db";
import { bestScores, latestByGame } from "@/games/history";
import { genreForGame, playSrc } from "@/games/catalog";
import { shelfMedals } from "@/games/medals";

export const metadata: Metadata = { title: "Your portfolio" };

export default function MePage() {
  return <><SiteHeader /><main id="main-content" className="page-shell"><Suspense fallback={<p className="shelf-loading" role="status">Loading your play history…</p>}><History /></Suspense></main><SiteFooter /></>;
}

async function History() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const [rows, games] = await Promise.all([playsForUser(session.user.id), loadGames()]);
  const latest = latestByGame(rows);
  const medals = shelfMedals(rows, (slug) => {
    const game = games.find((item) => item.slug === slug);
    return game ? genreForGame(game) : null;
  });
  const bests = bestScores(rows);
  return <>
    <div className="page-intro"><div><h1>Your portfolio</h1><p>Welcome back, {session.user.name}. Games you open while signed in stay here.</p></div><Link href="/library" className="button button-secondary"><Icon name="library" />Your library</Link></div>
    <section aria-labelledby="medals-heading">
      <h2 id="medals-heading">Medals</h2>
      <ul className="medal-row">
        {medals.map((medal) => <li key={medal.id} className="medal" data-earned={medal.earned ? "true" : "false"}><strong>{medal.title}</strong><small>{medal.earned ? "Earned" : medal.detail}</small></li>)}
      </ul>
    </section>
    {bests.length > 0 ? <section aria-labelledby="bests-heading"><h2 id="bests-heading">Best scores</h2><p className="small-note">A score is the number the game sent. It is your record here, not a checked ranking.</p><ul className="medal-row">{bests.map((best) => {
      const game = games.find((item) => item.slug === best.gameSlug);
      return <li key={best.gameSlug} className="medal" data-earned="true"><strong>{game?.title ?? best.gameSlug}</strong><small>{best.score.toLocaleString("en")}</small></li>;
    })}</ul></section> : null}
    {latest.length === 0 ? <div className="empty-state" style={{ marginBlock: "28px 54px" }}>
      <span className="empty-icon"><Icon name="gamepad" /></span><h2>Let’s start an adventure.</h2><p>Play a game while signed in and it will appear here for your next visit.</p><Link href="/" className="button button-primary">Discover games<Icon name="arrow" /></Link>
    </div> : <ul className="history-list">
      {latest.map((play) => {
        const game = games.find((item) => item.slug === play.gameSlug);
        const when = play.startedAt.toLocaleDateString("en", { dateStyle: "medium", timeZone: "UTC" });
        return <li key={play.id} className="history-card">
          {game ? <Image src={game.poster} alt="" width={340} height={200} sizes="170px" /> : null}
          <div className="history-info"><h2>{game?.title ?? play.gameSlug}</h2><p>Last played <time dateTime={play.startedAt.toISOString()}>{when}</time></p>{play.outcome === "win" || play.outcome === "loss" || play.outcome === "done" ? <p className="history-result">{play.outcome === "win" ? "Win" : play.outcome === "loss" ? "Loss" : "Finished"}{typeof play.score === "number" ? ` · ${play.score.toLocaleString("en")}` : ""}</p> : null}{play.summary ? <p className="history-result">{play.summary}</p> : null}</div>
          {game && playSrc(game) ? <div className="history-actions"><Link href={`/play/${game.slug}`} className="button button-primary"><Icon name="play" />Play again</Link></div> : null}
        </li>;
      })}
    </ul>}
  </>;
}
