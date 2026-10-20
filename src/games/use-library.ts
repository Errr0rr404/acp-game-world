"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_LIBRARY, parseLibrary, withRecentGame, withSavedGame, type LocalLibrary } from "./library";

export const LIBRARY_KEY = "game-world-library-v1";
const CHANGE_EVENT = "game-world-library-change";
let cached = EMPTY_LIBRARY;
let cachedRaw: string | null | undefined;
let memoryOnly = false;

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LIBRARY_KEY || event.key === null) {
      cachedRaw = undefined;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  if (!bootstrapped) {
    bootstrapped = true;
    void syncAccountLibrary();
  }
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

let accountSaved: string[] | null = null;
let signedIn = false;
let bootstrapped = false;

function updateLibrary(update: (library: LocalLibrary) => LocalLibrary) {
  cached = update(readLocal());
  const raw = JSON.stringify(cached);
  try {
    window.localStorage.setItem(LIBRARY_KEY, raw);
    cachedRaw = raw;
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function readLocal(): LocalLibrary {
  if (memoryOnly) return cached;
  try {
    const raw = window.localStorage.getItem(LIBRARY_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cached = parseLibrary(raw);
    }
  } catch {
    memoryOnly = true;
  }
  return cached;
}

function snapshot(): LocalLibrary {
  const local = readLocal();
  return accountSaved === null ? local : { ...local, saved: accountSaved };
}

async function syncAccountLibrary() {
  try {
    const response = await fetch("/api/library", { headers: { accept: "application/json" } });
    if (response.status === 401) {
      signedIn = false;
      accountSaved = null;
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return;
    }
    if (!response.ok) return;
    const body = await response.json() as { saved?: unknown };
    const server = Array.isArray(body.saved) ? body.saved.filter((slug): slug is string => typeof slug === "string") : [];
    const extras = readLocal().saved.filter((slug) => !server.includes(slug));
    let saved = server;
    if (extras.length > 0) {
      const merged = await fetch("/api/library", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slugs: [...server, ...extras].slice(0, 100) }),
      });
      if (merged.ok) {
        const next = await merged.json() as { saved?: unknown };
        if (Array.isArray(next.saved)) saved = next.saved.filter((slug): slug is string => typeof slug === "string");
      }
    }
    signedIn = true;
    accountSaved = saved;
    updateLibrary((library) => ({ ...library, saved }));
  } catch {
    // The browser list stays in place when the account cannot be reached.
  }
}

export function toggleSavedGame(slug: string) {
  const next = withSavedGame(snapshot(), slug);
  if (signedIn) {
    accountSaved = next.saved;
    void fetch("/api/library", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, saved: next.saved.includes(slug) }),
    }).catch(() => {});
  }
  updateLibrary(() => next);
}

export function rememberGame(slug: string) {
  updateLibrary((library) => withRecentGame(library, slug, Date.now()));
}

export function useLibrary() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_LIBRARY);
}

export function useLibrarySource() {
  return useSyncExternalStore(subscribe, () => signedIn ? "account" as const : "browser" as const, () => "browser" as const);
}
