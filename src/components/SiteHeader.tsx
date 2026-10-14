import { Suspense } from "react";
import Link from "next/link";
import { AccountChip } from "./AccountChip";
import { Icon } from "./Icon";
import { SiteNav } from "./SiteNav";

export function SiteHeader() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Game World home"><span className="brand-mark"><Icon name="gamepad" /></span>Game World<span className="brand-dot" /></Link>
          <SiteNav />
          <Suspense fallback={<span className="account-placeholder" aria-label="Loading account" />}><AccountChip /></Suspense>
        </div>
      </header>
    </>
  );
}
