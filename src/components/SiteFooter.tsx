import Link from "next/link";
import { Icon } from "./Icon";

export function SiteFooter() {
  return <footer className="site-footer page-shell">
    <span><Icon name="gamepad" />A little world of good games.</span>
    <div><Link href="/">Discover</Link><Link href="/library">Your library</Link><Link href="/sign-in">Sign in</Link></div>
  </footer>;
}
