import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SignInForm } from "@/components/SignInForm";
import { Icon } from "@/components/Icon";
import { accountsEnabled } from "@/games/policy";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return <><SiteHeader /><main id="main-content" className="page-shell auth-main">
    <div className="auth-layout">
      <div className="auth-story">
        <h1>Sign in</h1>
        <p>A familiar place for your next adventure. Sign in to keep your games, results, and medals with you.</p>
        <ul className="auth-benefits">
          <li><span><Icon name="clock" /></span><div><strong>Pick up the thread</strong>See which games you played and jump back in.</div></li>
          <li><span><Icon name="gamepad" /></span><div><strong>Just an email away</strong>A sign-in link. No password to remember.</div></li>
          <li><span><Icon name="heart" /></span><div><strong>Playing is always open</strong>You can play and save favorites as a guest.</div></li>
        </ul>
        <p className="small-note"><Link href="/">Keep playing as a guest</Link></p>
      </div>
      <section className="auth-panel" aria-labelledby="sign-in-panel-title">
        <h2 id="sign-in-panel-title">Welcome to your world.</h2>
        <p>Enter your email and we’ll send you a link to sign in.</p>
        <Suspense fallback={null}><AccountAvailability /></Suspense>
        <SignInForm />
        <p className="small-note">We use your email for sign-in. Your favorites stay in this browser.</p>
      </section>
    </div>
  </main><SiteFooter /></>;
}

async function AccountAvailability() {
  await connection();
  if (accountsEnabled()) return null;
  return <p className="notice">Accounts aren’t available here yet. You can still <Link href="/">play games</Link> and <Link href="/library">use your library</Link> as a guest.</p>;
}
