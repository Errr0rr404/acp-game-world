"use client";

import type { GameListing } from "@/games/catalog";
import { toggleSavedGame, useLibrary } from "@/games/use-library";
import { Icon } from "./Icon";

export function SaveGameButton({ game, compact = false }: { game: Pick<GameListing, "slug" | "title">; compact?: boolean }) {
  const { saved } = useLibrary();
  const selected = saved.includes(game.slug);
  return (
    <button type="button" className={`${compact ? "icon-button save-button" : "button button-secondary"} ${selected ? "is-saved" : ""}`}
      aria-label={`${selected ? "Unsave" : "Save"} ${game.title}`} aria-pressed={selected} title={`${selected ? "Unsave" : "Save"} ${game.title}`}
      onClick={() => toggleSavedGame(game.slug)}>
      <Icon name="heart" fill={selected ? "currentColor" : "none"} />
      {compact ? null : selected ? "Saved" : "Save game"}
    </button>
  );
}
