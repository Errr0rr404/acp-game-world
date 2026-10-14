import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { GameShelf } from "@/components/GameShelf";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { loadGames } from "@/db";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <><SiteHeader /><main id="main-content" className="page-shell"><Suspense fallback={<ShelfLoading />}><Shelf /></Suspense></main><SiteFooter /></>;
}

async function Shelf() {
  await connection();
  return <GameShelf games={await loadGames()} />;
}

function ShelfLoading() {
  return <div className="shelf-loading" role="status"><span className="loading-spinner" /><p>Opening your next adventure…</p></div>;
}
