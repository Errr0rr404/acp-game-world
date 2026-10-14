import { Suspense } from "react";
import { connection } from "next/server";
import { GameCard } from "@/components/GameCard";
import { SiteHeader } from "@/components/SiteHeader";
import { loadGames } from "@/db";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="max-w-xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Pick a game and play it here.
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-snug">
          No account needed. Sign in if you want this shelf to remember what you played.
        </p>
        <Suspense fallback={<p className="mt-8 text-lg">Opening the shelf…</p>}>
          <Shelf />
        </Suspense>
      </main>
    </>
  );
}

async function Shelf() {
  await connection();
  const games = await loadGames();
  return (
    <ul className="mt-8 grid list-none gap-6 sm:grid-cols-2">
      {games.map((game, index) => (
        <GameCard key={game.slug} game={game} priority={index === 0} />
      ))}
    </ul>
  );
}
