"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { genreForGame, playSrc, type GameListing } from "@/games/catalog";
import { Icon } from "./Icon";
import { SaveGameButton } from "./SaveGameButton";
import { ShareLinkButton } from "./ShareLinkButton";
import { publicUrl } from "@/site";

export function GameDetails({ game, onClose }: { game: GameListing; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const src = playSrc(game);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function close() {
    ref.current?.close();
    onClose();
  }

  return (
    <dialog ref={ref} className="game-dialog" aria-labelledby="detail-title" onCancel={(event) => { event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="dialog-content">
        <div className="dialog-art">
          <Image src={game.poster} alt="" width={1280} height={720} sizes="(min-width: 700px) 620px, 100vw" />
          <button type="button" className="icon-button dialog-close" aria-label="Close game details" onClick={close}><Icon name="close" /></button>
        </div>
        <div className="dialog-body">
          <span className="genre-label">{genreForGame(game)}</span>
          <h2 id="detail-title">{game.title}</h2>
          <p>{game.tagline}</p>
          <dl className="game-facts">
            <div><dt>Controls</dt><dd>{game.controls}</dd></div>
            <div><dt>Availability</dt><dd>{src ? "Play free in your browser" : "Coming soon"}</dd></div>
          </dl>
          {!src ? <p className="notice">{game.soonReason ?? "A browser version is in the works. Save this game to find it again."}</p> : null}
          <div className="dialog-actions">
            {src ? <Link className="button button-primary" href={`/play/${game.slug}`}><Icon name="play" />Play {game.title}</Link> : null}
            <SaveGameButton game={game} />
            {src ? <ShareLinkButton title={`${game.title} · Game World`} text={game.tagline} url={publicUrl(`/play/${game.slug}`)} label={`Share ${game.title}`} /> : null}
          </div>
          <p className="small-note">Saved games stay in this browser. Each game runs on its own site.</p>
        </div>
      </div>
    </dialog>
  );
}
