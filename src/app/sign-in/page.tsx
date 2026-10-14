import { SiteHeader } from "@/components/SiteHeader";
import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="font-display text-4xl font-semibold">Sign in</h1>
        <p className="mt-3 max-w-xl text-lg">
          Guests can play without an account. An account remembers which games you opened here.
        </p>
        <SignInForm />
      </main>
    </>
  );
}
