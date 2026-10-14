import { Suspense } from "react";
import Link from "next/link";
import { AccountChip } from "@/components/AccountChip";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-3xl font-semibold tracking-tight">
          Game World
        </Link>
        <Suspense fallback={<span className="font-display text-lg">Play free</span>}>
          <AccountChip />
        </Suspense>
      </div>
    </header>
  );
}
