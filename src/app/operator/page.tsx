import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { loadGames } from "@/db";
import { approvedOrigins, isOperator } from "@/games/policy";

export default function OperatorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Suspense fallback={<p>Opening the shelf tools…</p>}>
          <Editor searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Editor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!isOperator(session.user.email)) redirect("/");
  const query = await searchParams;
  const games = await loadGames();
  return (
    <>
      <h1 className="font-display text-4xl font-semibold">Shelf</h1>
      <p className="mt-3 max-w-xl text-lg">
        A game can open here only when its address is approved: {approvedOrigins().join(", ")}.
      </p>
      {query.error ? <p className="mt-4">{query.error}</p> : null}
      {query.saved ? <p className="mt-4">Saved {query.saved}.</p> : null}
      <div className="mt-6 flex flex-col gap-6">
        {games.map((game) => (
          <ListingForm key={game.slug} game={game} />
        ))}
        <ListingForm />
      </div>
    </>
  );
}

function ListingForm({
  game,
}: {
  game?: {
    slug: string;
    title: string;
    tagline: string;
    status: string;
    origin: string | null;
    poster: string;
    controls: string;
    soonReason: string | null;
  };
}) {
  return (
    <form action="/api/operator" method="post" className="grid gap-3 rounded-2xl border-2 border-ink bg-paper p-5">
      <h2 className="font-display text-2xl font-semibold">{game ? game.title : "Add a game"}</h2>
      <label className="grid gap-1">
        Slug
        <input name="slug" defaultValue={game?.slug ?? ""} required className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <label className="grid gap-1">
        Title
        <input name="title" defaultValue={game?.title ?? ""} required className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <label className="grid gap-1">
        Tagline
        <input name="tagline" defaultValue={game?.tagline ?? ""} required className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <label className="grid gap-1">
        Controls
        <input name="controls" defaultValue={game?.controls ?? ""} required className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <label className="grid gap-1">
        Poster path
        <input name="poster" defaultValue={game?.poster ?? "/posters/"} required className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <label className="grid gap-1">
        Status
        <select name="status" defaultValue={game?.status ?? "soon"} className="min-h-12 rounded-xl border-2 border-ink px-3">
          <option value="playable">playable</option>
          <option value="soon">soon</option>
        </select>
      </label>
      <label className="grid gap-1">
        Origin
        <input name="origin" defaultValue={game?.origin ?? ""} className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <label className="grid gap-1">
        Reason, if it is not playable
        <input name="soonReason" defaultValue={game?.soonReason ?? ""} className="min-h-12 rounded-xl border-2 border-ink px-3" />
      </label>
      <button type="submit" className="inline-flex min-h-12 w-fit items-center rounded-full border-2 border-ink bg-sun px-5 font-display text-lg font-semibold">
        Save
      </button>
    </form>
  );
}
