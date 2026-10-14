"use client";

import { useState } from "react";

export function SignInForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setDevLink(null);
    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          over13: form.get("over13") === "yes",
        }),
      });
      const body = (await response.json()) as { message?: string; devLink?: string | null };
      setMessage(body.message ?? "The sign-in link could not be sent.");
      setDevLink(body.devLink ?? null);
    } catch {
      setMessage("The sign-in link could not be sent.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-2 text-lg">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="min-h-12 rounded-xl border-2 border-ink bg-paper px-3"
        />
      </label>
      <label className="flex items-start gap-3 text-lg">
        <input name="over13" type="checkbox" value="yes" className="mt-1 h-5 w-5" />
        I am 13 or older.
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-sun px-5 font-display text-lg font-semibold shadow-[3px_3px_0_#1d2430] disabled:opacity-60"
      >
        Send a sign-in link
      </button>
      {message ? <p role="status">{message}</p> : null}
      {devLink ? (
        <a href={devLink} className="break-all underline">
          Open the sign-in link
        </a>
      ) : null}
    </form>
  );
}
