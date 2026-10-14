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
import { latestByGame } from "@/games/history";
import { playSrc } from "@/games/catalog";

export const metadata: Metadata = { title: "Play history" };

export default function MePage() {
  return <><SiteHeader /><main id="main-content" className="page-shell"><Suspense fallback={<p className="shelf-loading" role="status">Loading your play history…</p>}><History /></Suspense></main><SiteFooter /></>;
}

async function History() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const [rows, games] = await Promise.all([playsForUser(session.user.id), loadGames()]);
  const latest = latestByGame(rows);
  return <>
    <div className="page-intro"><div><h1>Your play history</h1><p>Welcome back, {session.user.name}. Here’s where you’ve been playing.</p></div><Link href="/library" className="button button-secondary"><Icon name="library" />Your library</Link></div>
    <p className="small-note">Recent games you opened while signed in. Your newest session for each game appears here.</p>
    {latest.length === 0 ? <div className="empty-state" style={{ marginBlock: "28px 54px" }}>
      <span className="empty-icon"><Icon name="gamepad" /></span><h2>Let’s start an adventure.</h2><p>Play a game while signed in and it will appear here for your next visit.</p><Link href="/" className="button button-primary">Discover games<Icon name="arrow" /></Link>
    </div> : <ul className="history-list">
      {latest.map((play) => {
        const game = games.find((item) => item.slug === play.gameSlug);
        const when = play.startedAt.toLocaleDateString("en", { dateStyle: "medium", timeZone: "UTC" });
        return <li key={play.id} className="history-card">
          {game ? <Image src={game.poster} alt="" width={340} height={200} sizes="170px" /> : null}
          <div className="history-info"><h2>{game?.title ?? play.gameSlug}</h2><p>Last played <time dateTime={play.startedAt.toISOString()}>{when}</time></p>{play.summary ? <p className="history-result">{play.summary}</p> : null}</div>
          {game && playSrc(game) ? <div className="history-actions"><Link href={`/play/${game.slug}`} className="button button-primary"><Icon name="play" />Play again</Link></div> : null}
        </li>;
      })}
    </ul>}
  </>;
}
