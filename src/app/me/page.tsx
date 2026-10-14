import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { loadGames, playsForUser } from "@/db";
import { latestByGame } from "@/games/history";

export default function MePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Suspense fallback={<p className="text-lg">Loading your games…</p>}>
          <History />
        </Suspense>
      </main>
    </>
  );
}

async function History() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const [rows, games] = await Promise.all([playsForUser(session.user.id), loadGames()]);
  const latest = latestByGame(
    rows.map((row) => ({
      id: row.id,
      gameSlug: row.gameSlug,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      summary: row.summary,
    })),
  );
  return (
    <>
      <h1 className="font-display text-4xl font-semibold">Your games</h1>
      {latest.length === 0 ? (
        <p className="mt-3 text-lg">You have not played a game on this shelf yet.</p>
      ) : (
        <ul className="mt-6 flex list-none flex-col gap-4">
          {latest.map((play) => {
            const game = games.find((item) => item.slug === play.gameSlug);
            const when = play.startedAt.toLocaleString("en", { dateStyle: "medium", timeStyle: "short" });
            return (
              <li key={play.id} className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_#1d2430]">
                <h2 className="font-display text-2xl font-semibold">{game?.title ?? play.gameSlug}</h2>
                <p className="mt-1">{when}</p>
                {play.summary ? <p className="mt-1">{play.summary}</p> : null}
                {game?.status === "playable" ? (
                  <Link
                    href={`/play/${game.slug}`}
                    className="mt-4 inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-sun px-5 font-display text-lg font-semibold"
                  >
                    Play again
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
