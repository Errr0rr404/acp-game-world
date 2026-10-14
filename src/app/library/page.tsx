import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { GameShelf } from "@/components/GameShelf";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { loadGames } from "@/db";

export const metadata: Metadata = { title: "Your library", description: "Your saved and recently played browser games." };

export default function LibraryPage() {
  return <><SiteHeader /><main id="main-content" className="page-shell"><Suspense fallback={<p className="shelf-loading" role="status">Opening your library…</p>}><Library /></Suspense></main><SiteFooter /></>;
}

async function Library() {
  await connection();
  return <GameShelf games={await loadGames()} mode="library" />;
}
