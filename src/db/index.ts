import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { GAME_GENRES, games, isHttpsOrigin, type GameGenre, type GameListing } from "@/games/catalog";
import { approvedOrigins } from "@/games/policy";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalForDb.pool) globalForDb.pool = new Pool({
    connectionString: url,
    max: 5,
    connectionTimeoutMillis: 4000,
    query_timeout: 5000,
    idleTimeoutMillis: 30_000,
  });
  return globalForDb.pool;
}

export function getDb() {
  const pool = getPool();
  if (!pool) return null;
  return drizzle(pool, { schema });
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  const pool = getPool();
  if (!pool) return Promise.resolve();
  schemaReady ??= pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      email_verified boolean NOT NULL DEFAULT false,
      image text,
      over13 boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "session" (
      id text PRIMARY KEY,
      expires_at timestamp NOT NULL,
      token text NOT NULL UNIQUE,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now(),
      ip_address text,
      user_agent text,
      user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS session_user_id_idx ON "session"(user_id);
    CREATE TABLE IF NOT EXISTS "account" (
      id text PRIMARY KEY,
      account_id text NOT NULL,
      provider_id text NOT NULL,
      user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      access_token text,
      refresh_token text,
      id_token text,
      access_token_expires_at timestamp,
      refresh_token_expires_at timestamp,
      scope text,
      password text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS account_user_id_idx ON "account"(user_id);
    CREATE TABLE IF NOT EXISTS "verification" (
      id text PRIMARY KEY,
      identifier text NOT NULL,
      value text NOT NULL,
      expires_at timestamp NOT NULL,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS "signin_gate" (
      email text PRIMARY KEY,
      expires_at timestamp NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "play_session" (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      game_slug text NOT NULL,
      started_at timestamp NOT NULL DEFAULT now(),
      ended_at timestamp,
      summary text
    );
    CREATE INDEX IF NOT EXISTS play_session_user_started_idx ON "play_session"(user_id, started_at);
    CREATE TABLE IF NOT EXISTS "game_listing" (
      slug text PRIMARY KEY,
      title text NOT NULL,
      tagline text NOT NULL,
      status text NOT NULL,
      origin text,
      poster text NOT NULL,
      controls text NOT NULL,
      soon_reason text,
      sort integer NOT NULL DEFAULT 0,
      genre text
    );
    ALTER TABLE "game_listing" ADD COLUMN IF NOT EXISTS genre text;
  `).then(() => undefined).catch((error: unknown) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}

function publishable(game: GameListing): GameListing {
  if (game.status !== "playable") return game;
  if (game.origin && isHttpsOrigin(game.origin) && approvedOrigins().includes(game.origin)) return game;
  return {
    ...game,
    status: "soon",
    origin: null,
    soonReason: "This game is not approved to open here.",
  };
}

export async function loadGames(): Promise<GameListing[]> {
  const db = getDb();
  if (!db) return games.map(publishable);
  try {
    await ensureSchema();
    await db.insert(schema.gameListing).values(games.map((game, sort) => ({
      slug: game.slug,
      title: game.title,
      tagline: game.tagline,
      status: game.status,
      origin: game.origin,
      poster: game.poster,
      controls: game.controls,
      soonReason: game.soonReason,
      sort,
      genre: game.genre,
    }))).onConflictDoNothing();
    const rows = await db.select().from(schema.gameListing).orderBy(schema.gameListing.sort);
    if (rows.length === 0) return games.map(publishable);
    return rows.map((row) =>
      publishable({
        slug: row.slug,
        title: row.title,
        genre: GAME_GENRES.includes(row.genre as GameGenre) ? row.genre as GameGenre : undefined,
        tagline: row.tagline,
        status: row.status === "playable" ? "playable" : "soon",
        origin: row.origin,
        poster: row.poster,
        controls: row.controls,
        soonReason: row.soonReason,
      }),
    );
  } catch (error) {
    console.error("game catalog fell back to the built-in list", error);
    return games.map(publishable);
  }
}

export async function startPlaySession(userId: string, gameSlug: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const id = crypto.randomUUID();
  await db.insert(schema.playSession).values({ id, userId, gameSlug });
  return id;
}

export async function updatePlaySession(
  id: string,
  userId: string,
  patch: { summary?: string; end?: boolean },
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await ensureSchema();
  if (patch.summary === undefined && !patch.end) return false;
  const updated = await db
    .update(schema.playSession)
    .set({
      ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch.end ? { endedAt: sql`coalesce(${schema.playSession.endedAt}, now())` } : {}),
    })
    .where(and(eq(schema.playSession.id, id), eq(schema.playSession.userId, userId)))
    .returning({ id: schema.playSession.id });
  return updated.length > 0;
}

export async function playsForUser(userId: string) {
  const db = getDb();
  if (!db) return [];
  await ensureSchema();
  return db
    .select()
    .from(schema.playSession)
    .where(eq(schema.playSession.userId, userId))
    .orderBy(desc(schema.playSession.startedAt))
    .limit(200);
}

export async function openSignInGate(email: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await db
    .insert(schema.signinGate)
    .values({ email, expiresAt })
    .onConflictDoUpdate({ target: schema.signinGate.email, set: { expiresAt } });
}

export async function consumeSignInGate(email: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await ensureSchema();
  const [row] = await db.delete(schema.signinGate).where(eq(schema.signinGate.email, email)).returning();
  return Boolean(row && row.expiresAt.getTime() > Date.now());
}

export async function saveListing(input: {
  slug: string;
  title: string;
  genre?: GameGenre;
  tagline: string;
  status: "playable" | "soon";
  origin: string | null;
  poster: string;
  controls: string;
  soonReason: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("database missing");
  await ensureSchema();
  const [highest] = await db
    .select({ sort: schema.gameListing.sort })
    .from(schema.gameListing)
    .orderBy(desc(schema.gameListing.sort))
    .limit(1);
  await db
    .insert(schema.gameListing)
    .values({ ...input, sort: (highest?.sort ?? -1) + 1 })
    .onConflictDoUpdate({
      target: schema.gameListing.slug,
      set: {
        title: input.title,
        genre: input.genre ?? "Arcade",
        tagline: input.tagline,
        status: input.status,
        origin: input.origin,
        poster: input.poster,
        controls: input.controls,
        soonReason: input.soonReason,
      },
    });
}
