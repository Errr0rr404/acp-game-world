"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { parseGameMessage, type GameResult } from "@/games/bridge";
import { classifyFrameDocument, type FramePermission, type FrameVerdict } from "@/games/frame";
import { rememberGame } from "@/games/use-library";
import { Icon } from "./Icon";
import { SaveGameButton } from "./SaveGameButton";

const SLOW_AFTER_MS = 12_000;
const subscribeFullscreenAvailability = () => () => {};

export function PlayFrame({ slug, title, controls, frameSrc, siteHref, permission, recordHistory, playerName }: {
  slug: string;
  title: string;
  controls: string;
  frameSrc: string;
  siteHref: string;
  permission: FramePermission;
  recordHistory: boolean;
  playerName: string | null;
}) {
  const router = useRouter();
  const shell = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const sessionId = useRef<string | null>(null);
  const endedSession = useRef<string | null>(null);
  const started = useRef(false);
  const mounted = useRef(false);
  const leaving = useRef(false);
  const latestResult = useRef<GameResult | null>(null);
  const [verdict, setVerdict] = useState<FrameVerdict>(permission === "blocked" ? "blocked" : "pending");
  const [attempt, setAttempt] = useState(0);
  const [slowDismissed, setSlowDismissed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canFullscreen = useSyncExternalStore(subscribeFullscreenAvailability, () => Boolean(document.fullscreenEnabled), () => false);

  const endSession = useCallback(() => {
    const id = sessionId.current;
    if (!id || endedSession.current === id) return;
    endedSession.current = id;
    const url = `/api/sessions/${encodeURIComponent(id)}`;
    const body = JSON.stringify({ end: true });
    try {
      if (navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))) return;
    } catch { /* Fall back when beacons are unavailable. */ }
    void fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, []);

  const saveResult = useCallback(async (result: GameResult) => {
    const id = sessionId.current;
    if (!id) return;
    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary: result.summary, outcome: result.outcome, score: result.score }),
      });
      if (mounted.current && !leaving.current) setMessage(response.ok ? "Result saved to your play history." : "Your result could not be saved. You can keep playing.");
    } catch {
      if (mounted.current && !leaving.current) setMessage("Your result could not be saved. You can keep playing.");
    }
  }, []);

  const beginPlay = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    rememberGame(slug);
    if (!recordHistory) return;
    try {
      const response = await fetch("/api/sessions", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true,
      });
      const body = await response.json() as { id?: unknown };
      if (!response.ok || typeof body.id !== "string") throw new Error("history unavailable");
      sessionId.current = body.id;
      if (!mounted.current || leaving.current) endSession();
      else if (latestResult.current) void saveResult(latestResult.current);
    } catch {
      if (mounted.current && !leaving.current) setMessage("Your account history is unavailable. This game is still in your recent games.");
    }
  }, [slug, recordHistory, endSession, saveResult]);

  useEffect(() => {
    if (permission === "blocked") return;
    const timer = window.setTimeout(() => setVerdict((current) => current === "pending" ? "slow" : current), SLOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [permission, frameSrc, attempt]);

  useEffect(() => {
    mounted.current = true;
    const hide = () => { leaving.current = true; endSession(); };
    window.addEventListener("pagehide", hide);
    return () => {
      mounted.current = false;
      window.removeEventListener("pagehide", hide);
      // Strict Mode immediately mounts again; only a real unmount ends the session.
      queueMicrotask(() => { if (!mounted.current) endSession(); });
    };
  }, [endSession]);

  useEffect(() => {
    const origin = new URL(frameSrc).origin;
    function onMessage(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow) return;
      const parsed = parseGameMessage(event.data, event.origin, origin);
      if (!parsed) return;
      if (parsed.type === "game.ready") {
        setVerdict("playing");
        void beginPlay();
      } else if (parsed.type === "game.exit") {
        leaving.current = true;
        endSession();
        router.push("/");
      } else if (parsed.type === "game.result") {
        latestResult.current = parsed;
        void saveResult(parsed);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameSrc, beginPlay, endSession, saveResult, router]);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  function onLoad(element: HTMLIFrameElement) {
    element.contentWindow?.postMessage(
      { type: "hub.hello", v: 1, player: playerName ? { displayName: playerName } : null },
      new URL(frameSrc).origin,
    );
    let next: FrameVerdict;
    try { next = classifyFrameDocument("same-origin", element.contentWindow?.location.href ?? ""); }
    catch { next = classifyFrameDocument("cross-origin", ""); }
    setVerdict(next);
    if (next === "playing") void beginPlay();
  }

  function reloadGame() {
    if (permission === "blocked") { window.location.reload(); return; }
    setVerdict("pending");
    setSlowDismissed(false);
    setMessage(null);
    setAttempt((current) => current + 1);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.current?.requestFullscreen();
    } catch { setMessage("Fullscreen is unavailable in this browser. You can keep playing here."); }
  }

  function leave() { leaving.current = true; endSession(); }
  const covered = verdict === "pending" || verdict === "blocked" || (verdict === "slow" && !slowDismissed);

  return (
    <div ref={shell} className="play-shell">
      <header className="play-header">
        <div className="play-heading">
          <Link href="/" className="brand-mark" aria-label="Game World home" onClick={leave}><Icon name="gamepad" /></Link>
          <div><h1>{title}</h1><p>{verdict === "playing" ? "Enjoy your escape." : "Getting your game ready."}</p></div>
        </div>
        <div className="play-toolbar">
          <span className="save-in-player"><SaveGameButton game={{ slug, title }} compact={false} /></span>
          <button type="button" className="icon-button" aria-label="Game controls" aria-expanded={helpOpen} aria-controls="player-controls" title="Game controls" onClick={() => setHelpOpen(!helpOpen)}><Icon name="info" /></button>
          <button type="button" className="icon-button" aria-label="Reload game" title="Reload game" onClick={reloadGame}><Icon name="refresh" /></button>
          {canFullscreen ? <button type="button" className="icon-button" aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen}><Icon name={fullscreen ? "minimize" : "fullscreen"} /></button> : null}
          <a href={siteHref} target="_blank" rel="noopener noreferrer" className="button button-quiet" aria-label="Open on its own site" title="Open on its own site"><Icon name="external" /><span className="external-label">Open on its own site</span></a>
          <Link href="/" className="button button-secondary" onClick={leave}>Leave game<Icon name="arrow" /></Link>
        </div>
      </header>
      <main id="main-content" className="player-area" data-frame-state={verdict}>
        {permission !== "blocked" ? <iframe key={attempt} ref={frame} title={title} src={frameSrc}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          allow="autoplay; camera; fullscreen; gamepad; microphone; pointer-lock" allowFullScreen referrerPolicy="origin"
          aria-hidden={covered} tabIndex={covered ? -1 : 0}
          onLoad={(event) => onLoad(event.currentTarget)} onError={() => setVerdict("blocked")} /> : null}
        {verdict === "pending" ? (
          <div className="player-overlay"><div className="player-status">
            <div className="player-loading" role="status"><span className="loading-spinner" /><h2>Opening {title}…</h2></div>
            <p>A little patience. A whole new world.</p>
          </div></div>
        ) : null}
        {verdict === "slow" && !slowDismissed ? (
          <div className="player-overlay"><div className="player-status">
            <span className="empty-icon"><Icon name="clock" /></span><h2>{title} is taking a little longer.</h2>
            <p>The connection may be slow. Keep waiting, reload, or try the game on its own site.</p>
            <div className="player-status-actions">
              <button type="button" className="button button-primary" onClick={() => { setSlowDismissed(true); frame.current?.focus(); }}>Keep waiting</button>
              <button type="button" className="button button-secondary" onClick={reloadGame}><Icon name="refresh" />Try again</button>
              <a href={siteHref} target="_blank" rel="noopener noreferrer" className="button button-quiet">Open on its own site<Icon name="external" /></a>
            </div>
          </div></div>
        ) : null}
        {verdict === "blocked" ? (
          <div className="player-overlay"><div className="player-status">
            <span className="empty-icon"><Icon name="external" /></span><h2>{title} cannot open here right now.</h2>
            <p>You can still play on its own site, or try loading it again.</p>
            <div className="player-status-actions">
              <a href={siteHref} target="_blank" rel="noopener noreferrer" className="button button-primary">Open on its own site<Icon name="external" /></a>
              <button type="button" className="button button-secondary" onClick={reloadGame}><Icon name="refresh" />Try again</button>
            </div>
          </div></div>
        ) : null}
        {helpOpen ? <section id="player-controls" className="player-help" aria-labelledby="controls-heading">
          <button type="button" className="icon-button" aria-label="Close controls" onClick={() => setHelpOpen(false)}><Icon name="close" /></button>
          <h2 id="controls-heading">Ready, player?</h2><p>{controls}. Click or tap inside the game to give it focus.</p>
          <p>The game shows its own controls. Use Leave game to return to the games, and Esc to exit fullscreen.</p>
        </section> : null}
        {message ? <p role="status" className="player-message">{message}</p> : null}
      </main>
    </div>
  );
}
