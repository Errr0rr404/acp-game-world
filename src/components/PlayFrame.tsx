"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseGameMessage } from "@/games/bridge";
import { classifyFrameDocument, type FramePermission, type FrameVerdict } from "@/games/frame";

const DECIDE_AFTER_MS = 4000;

export function PlayFrame({
  title,
  frameSrc,
  siteHref,
  permission,
  sessionId,
  playerName,
}: {
  title: string;
  frameSrc: string;
  siteHref: string;
  permission: FramePermission;
  sessionId: string | null;
  playerName: string | null;
}) {
  const router = useRouter();
  const [verdict, setVerdict] = useState<FrameVerdict>(permission === "allowed" ? "pending" : "blocked");

  useEffect(() => {
    if (permission !== "allowed") return;
    const timer = window.setTimeout(() => {
      setVerdict((current) => (current === "pending" ? "blocked" : current));
    }, DECIDE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [permission, frameSrc]);

  useEffect(() => {
    if (!sessionId) return;
    const end = () => {
      navigator.sendBeacon(
        `/api/sessions/${sessionId}`,
        new Blob([JSON.stringify({ end: true })], { type: "application/json" }),
      );
    };
    window.addEventListener("pagehide", end);
    return () => window.removeEventListener("pagehide", end);
  }, [sessionId]);

  useEffect(() => {
    const origin = new URL(frameSrc).origin;
    function onMessage(event: MessageEvent) {
      const parsed = parseGameMessage(event.data, event.origin, origin);
      if (!parsed) return;
      if (parsed.type === "game.exit") {
        if (sessionId) navigator.sendBeacon(`/api/sessions/${sessionId}`, new Blob([JSON.stringify({ end: true })], { type: "application/json" }));
        router.push("/");
      }
      if (parsed.type === "game.result" && sessionId) {
        void fetch(`/api/sessions/${sessionId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ summary: parsed.summary }),
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameSrc, router, sessionId]);

  function onLoad(frame: HTMLIFrameElement) {
    if (permission === "allowed") {
      frame.contentWindow?.postMessage(
        { type: "hub.hello", v: 1, player: playerName ? { displayName: playerName } : null },
        new URL(frameSrc).origin,
      );
    }
    if (permission !== "allowed") return;
    try {
      const href = frame.contentWindow?.location.href ?? "";
      setVerdict(classifyFrameDocument("same-origin", href));
    } catch {
      setVerdict(classifyFrameDocument("cross-origin", ""));
    }
  }

  const covered = permission !== "allowed" || verdict === "blocked";

  return (
    <div className="flex h-dvh flex-col bg-ink text-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-paper px-4 py-3 text-ink">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href={siteHref} target="_blank" rel="noopener noreferrer" className="underline">
            Open on its own site
          </a>
          <Link
            href="/"
            onClick={() => {
              if (!sessionId) return;
              navigator.sendBeacon(
                `/api/sessions/${sessionId}`,
                new Blob([JSON.stringify({ end: true })], { type: "application/json" }),
              );
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-sun px-5 font-display text-lg font-semibold shadow-[3px_3px_0_#1d2430] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Leave game
          </Link>
        </div>
      </header>
      <div className="relative min-h-0 flex-1" data-frame-state={verdict}>
        <iframe
          title={title}
          src={frameSrc}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-fullscreen"
          allow="autoplay; fullscreen; gamepad; pointer-lock"
          referrerPolicy="origin"
          className="h-full w-full border-0 bg-ink"
          aria-hidden={covered}
          onLoad={(event) => onLoad(event.currentTarget)}
        />
        {permission === "allowed" && verdict === "pending" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink p-6">
            <p role="status" className="font-display text-2xl">
              Opening {title}…
            </p>
          </div>
        ) : null}
        {covered ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink p-6">
            <div className="max-w-md rounded-2xl border-2 border-ink bg-paper p-6 text-ink shadow-[4px_4px_0_#fffdf8]">
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {permission === "unreachable"
                  ? `${title} did not respond.`
                  : `${title} will not open inside this page yet.`}
              </h2>
              <p className="mt-3 text-lg leading-snug">You can still play it on its own site.</p>
              <a
                href={siteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-sun px-5 font-display text-lg font-semibold shadow-[3px_3px_0_#1d2430]"
              >
                Open on its own site
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
