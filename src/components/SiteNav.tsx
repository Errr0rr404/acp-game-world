"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export function SiteNav() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="site-nav">
    <Link href="/" aria-current={pathname === "/" ? "page" : undefined}><Icon name="gamepad" />Discover</Link>
    <Link href="/library" aria-current={pathname === "/library" ? "page" : undefined}><Icon name="library" />Your library</Link>
  </nav>;
}
