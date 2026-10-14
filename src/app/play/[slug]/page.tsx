import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/auth";
import { PlayFrame } from "@/components/PlayFrame";
import { frameSrc, games, playSrc } from "@/games/catalog";
import { ancestorOrigin, readFramePermission } from "@/games/frame";
import { loadGames, startPlaySession } from "@/db";

export function generateStaticParams() {
  return games
    .filter((game) => game.status === "playable")
    .map((game) => ({ slug: game.slug }));
}

type PlayPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  return { title: game?.title ?? "Game" };
}

function Opening() {
  return (
    <div className="flex h-dvh items-center justify-center bg-ink text-paper">
      <p role="status" className="font-display text-2xl">
        Opening the game…
      </p>
    </div>
  );
}

async function PlayRoute({ params }: Pick<PlayPageProps, "params">) {
  const { slug } = await params;
  const game = (await loadGames()).find((item) => item.slug === slug);
  const src = game ? playSrc(game) : null;
  const framed = game ? frameSrc(game) : null;
  if (!game || !src || !framed) redirect("/");
  const permission = await readFramePermission(src, ancestorOrigin(await headers()));
  const session = await getSession();
  let sessionId: string | null = null;
  if (session) {
    try {
      sessionId = await startPlaySession(session.user.id, game.slug);
    } catch (error) {
      console.error("play session was not recorded", error);
    }
  }
  return (
    <PlayFrame
      title={game.title}
      frameSrc={framed}
      siteHref={src}
      permission={permission}
      sessionId={sessionId}
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
