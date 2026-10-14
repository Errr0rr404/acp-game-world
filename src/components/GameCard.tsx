"use client";

import Image from "next/image";
import Link from "next/link";
import type { GameListing } from "@/games/catalog";
import { genreForGame, playSrc } from "@/games/catalog";
import { Icon } from "./Icon";
import { SaveGameButton } from "./SaveGameButton";

export function GameCard({ game, onDetails }: { game: GameListing; onDetails: (game: GameListing, trigger: HTMLButtonElement) => void }) {
  const playable = Boolean(playSrc(game));
  return (
    <li>
      <article aria-labelledby={`game-${game.slug}`} className="game-card">
        <div className="game-card-art">
          <Image src={game.poster} alt="" width={1280} height={720} sizes="(min-width: 1280px) 592px, (min-width: 700px) 45vw, 100vw" />
          <span className={`availability ${playable ? "is-ready" : "is-soon"}`}>
            <span className="status-dot" />{playable ? "Ready to play" : "Coming soon"}
          </span>
          <SaveGameButton game={game} compact />
        </div>
        <div className="game-card-body">
          <div className="game-card-heading">
            <h3 id={`game-${game.slug}`}>{game.title}</h3>
            <span className="genre-label">{genreForGame(game)}</span>
          </div>
          <p className="game-description">{game.tagline}</p>
          <p className="game-controls"><Icon name="keyboard" />{game.controls}</p>
          <div className="game-card-actions">
            {playable ? (
              <Link href={`/play/${game.slug}`} className="button button-primary"><Icon name="play" />Play {game.title}</Link>
            ) : (
              <span className="coming-label"><Icon name="clock" />In the works</span>
            )}
            <button type="button" className="button button-quiet" onClick={(event) => onDetails(game, event.currentTarget)} aria-label={`About ${game.title}`}>
              Game details<Icon name="arrow" />
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}
