import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return <><SiteHeader /><main id="main-content" className="page-shell auth-main"><div className="empty-state"><span className="empty-icon"><Icon name="gamepad" /></span><h1>This world hasn’t been discovered.</h1><p>That page doesn’t exist. There’s still plenty to play.</p><Link href="/" className="button button-primary">Back to games<Icon name="arrow" /></Link></div></main><SiteFooter /></>;
}
