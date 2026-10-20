import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/auth";
import { PlayFrame } from "@/components/PlayFrame";
import { frameSrc, playSrc } from "@/games/catalog";
import { ancestorOrigin, readFramePermission } from "@/games/frame";
import { loadGames } from "@/db";

type PlayPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = (await loadGames()).find((item) => item.slug === slug);
  return {
    title: game?.title ?? "Game",
    description: game?.tagline,
    alternates: { canonical: `/play/${slug}` },
    openGraph: { title: game ? `${game.title} · Game World` : "Game World", description: game?.tagline, url: `/play/${slug}`, siteName: "Game World", type: "website" },
    twitter: { card: "summary_large_image", title: game ? `${game.title} · Game World` : "Game World", description: game?.tagline },
  };
}

function Opening() {
  return (
    <div className="play-opening"><div className="player-loading" role="status"><span className="loading-spinner" /><p>Opening the game…</p></div></div>
  );
}

async function PlayRoute({ params }: Pick<PlayPageProps, "params">) {
  const { slug } = await params;
  const game = (await loadGames()).find((item) => item.slug === slug);
  const src = game ? playSrc(game) : null;
  const framed = game ? frameSrc(game) : null;
  if (!game || !src || !framed) redirect("/");
  const ancestor = ancestorOrigin(await headers());
  const [permission, session] = await Promise.all([readFramePermission(src, ancestor), getSession()]);
  return (
    <PlayFrame
      key={`${game.slug}:${permission}`}
      slug={game.slug}
      title={game.title}
      controls={game.controls}
      frameSrc={framed}
      siteHref={src}
      permission={permission}
      recordHistory={Boolean(session)}
      playerName={session?.user.name ?? null}
    />
  );
}

export default function Page({ params }: PlayPageProps) {
  return (
    <Suspense fallback={<Opening />}>
      <PlayRoute params={params} />
    </Suspense>
  );
}
