import Image from "next/image";
import Link from "next/link";
import type { GameListing } from "@/games/catalog";
import { playSrc } from "@/games/catalog";

export function GameCard({ game, priority = false }: { game: GameListing; priority?: boolean }) {
  const src = playSrc(game);

  return (
    <li>
      <article
        aria-labelledby={`game-${game.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[4px_4px_0_#1d2430]"
      >
        <Image
          src={game.poster}
          alt=""
          width={1280}
          height={720}
          priority={priority}
          sizes="(min-width: 640px) 480px, 100vw"
          className="aspect-video w-full bg-ink object-cover"
        />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h2 id={`game-${game.slug}`} className="font-display text-3xl font-semibold leading-none">
            {game.title}
          </h2>
          <p className="text-lg leading-snug">{game.tagline}</p>
          <p className="text-base">
            {game.status === "soon" ? game.soonReason : game.controls}
          </p>
          <div className="mt-auto pt-2">
            {src ? (
              <Link
                href={`/play/${game.slug}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-sun px-5 font-display text-lg font-semibold shadow-[3px_3px_0_#1d2430] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Play
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full border-2 border-ink bg-paper px-5 font-display text-lg font-semibold"
              >
                Not on the web yet
              </button>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
