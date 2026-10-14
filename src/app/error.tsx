"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Icon } from "@/components/Icon";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return <main id="main-content" className="page-shell auth-main">
    <div className="empty-state"><span className="empty-icon"><Icon name="refresh" /></span><h1>This world needs another moment.</h1><p>The page couldn’t load. Try again, or head back to discover a game.</p>
      <div className="player-status-actions"><button type="button" className="button button-primary" disabled={pending} onClick={() => startTransition(retry)}>{pending ? "Trying again…" : "Try again"}</button><Link href="/" className="button button-secondary">Back to games</Link></div>
    </div>
  </main>;
}
