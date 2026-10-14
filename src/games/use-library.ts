"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_LIBRARY, parseLibrary, withRecentGame, withSavedGame, type LocalLibrary } from "./library";

export const LIBRARY_KEY = "game-world-library-v1";
const CHANGE_EVENT = "game-world-library-change";
let cached = EMPTY_LIBRARY;
let cachedRaw: string | null | undefined;
let memoryOnly = false;

function snapshot(): LocalLibrary {
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

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LIBRARY_KEY || event.key === null) {
      cachedRaw = undefined;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function updateLibrary(update: (library: LocalLibrary) => LocalLibrary) {
  cached = update(snapshot());
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

export function toggleSavedGame(slug: string) {
  updateLibrary((library) => withSavedGame(library, slug));
}

export function rememberGame(slug: string) {
  updateLibrary((library) => withRecentGame(library, slug, Date.now()));
}

export function useLibrary() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_LIBRARY);
}
