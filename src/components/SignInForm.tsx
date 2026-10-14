"use client";

import { useRef, useState } from "react";
import { signInError } from "@/games/policy";
import { Icon } from "./Icon";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [over13, setOver13] = useState(false);
  const [error, setError] = useState<{ field: "email" | "age" | "request"; message: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const ageInput = useRef<HTMLInputElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const problem = signInError({ email, over13 });
    if (problem) {
      const field = problem === "Confirm you are 13 or older." ? "age" : "email";
      setError({ field, message: problem });
      if (field === "email") emailInput.current?.focus();
      else ageInput.current?.focus();
      return;
    }
    setPending(true);
    setError(null);
    setDevLink(null);
    try {
      const response = await fetch("/api/sign-in", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), over13 }),
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.json() as { ok?: boolean; message?: string; devLink?: string | null };
      if (!response.ok || !body.ok) {
        setError({ field: "request", message: body.message ?? "The sign-in link could not be sent. Try again." });
      } else {
        setDevLink(body.devLink ?? null);
        setSent(true);
      }
    } catch {
      setError({ field: "request", message: "The sign-in link could not be sent. Check your connection and try again." });
    } finally { setPending(false); }
  }

  if (sent) return <div className="auth-success" role="status">
    <span className="auth-success-icon"><Icon name="mail" width="28" height="28" /></span>
    <h3>{devLink ? "Your link is ready." : "Check your inbox."}</h3>
    <p>{devLink ? <>Email isn’t sent in this preview. Use the link below to sign in as <strong>{email.trim()}</strong>.</> : <>We sent a sign-in link to <strong>{email.trim()}</strong>. It expires in 15 minutes. Check your spam folder if you don’t see it.</>}</p>
    {devLink ? <p className="notice"><a href={devLink}>Open the development sign-in link</a></p> : null}
    <button type="button" className="button button-secondary" onClick={() => { setSent(false); setDevLink(null); setEmail(""); setError(null); }}>Use another email</button>
  </div>;

  return <form onSubmit={onSubmit} className="auth-form" aria-label="Email sign-in" noValidate aria-busy={pending}>
    <div className="form-field"><label htmlFor="email">Email</label>
    <input ref={emailInput} id="email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254}
      placeholder="you@example.com" className="form-input" value={email} onChange={(event) => { setEmail(event.target.value); if (error?.field === "email") setError(null); }}
      aria-invalid={error?.field === "email"} aria-describedby={error?.field === "email" ? "email-error" : undefined} /></div>
    {error?.field === "email" ? <p id="email-error" role="alert" className="field-error">{error.message}</p> : null}
    <label className="check-field">
      <input ref={ageInput} name="over13" type="checkbox" checked={over13} value="yes" onChange={(event) => { setOver13(event.target.checked); if (error?.field === "age") setError(null); }}
        aria-invalid={error?.field === "age"} aria-describedby={error?.field === "age" ? "age-error" : undefined} />
      I am 13 or older.
    </label>
    {error?.field === "age" ? <p id="age-error" role="alert" className="field-error">{error.message}</p> : null}
    <button type="submit" disabled={pending} className="button button-primary">{pending ? <><span className="loading-spinner" />Sending your link…</> : <><Icon name="mail" />Send a sign-in link</>}</button>
    {error?.field === "request" ? <p role="alert" className="notice notice-error">{error.message}</p> : null}
  </form>;
}
