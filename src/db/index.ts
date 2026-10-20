import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { ResultSetHeader } from "mysql2";
import { GAME_GENRES, games, isHttpsOrigin, type GameGenre, type GameListing } from "@/games/catalog";
import { approvedOrigins } from "@/games/policy";
import { CATALOG_TTL_MS, createCatalogLoader } from "./catalog-cache";
import { installPoolGuards, SESSION_LIMITS_SQL } from "./pool-guard";
import * as schema from "./schema";
import { seedBuiltinGames } from "./seed";

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

export function getPool(): mysql.Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalForDb.pool) {
    const pool = mysql.createPool({
      uri: url,
      connectionLimit: 5,
      queueLimit: 50,
      connectTimeout: 4000,
      idleTimeout: 30_000,
      enableKeepAlive: true,
      timezone: "Z",
    });
    installPoolGuards(pool);
    pool.on("connection", (connection) => {
      // The pool event hands over the callback connection, not the promise API.
      // max_execution_time covers SELECTs. innodb_lock_wait_timeout covers writes
      // that are stuck waiting on a row lock. The client timeout covers the rest.
      const query = connection.query as unknown as (
        sql: string,
        callback: (error: Error | null) => void,
      ) => void;
      query.call(connection, SESSION_LIMITS_SQL, () => undefined);
    });
    globalForDb.pool = pool;
  }
  return globalForDb.pool;
}

function affected(result: [ResultSetHeader, unknown] | ResultSetHeader): number {
  const header = Array.isArray(result) ? result[0] : result;
  return header?.affectedRows ?? 0;
}

export function getDb() {
  const pool = getPool();
  if (!pool) return null;
  return drizzle(pool, { schema, mode: "default" });
}

let schemaReady: Promise<void> | null = null;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`user\` (
      id varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL,
      email_verified boolean NOT NULL DEFAULT false,
      image text,
      over13 boolean NOT NULL DEFAULT false,
      created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY user_email_unique (email)
    )`,
  `CREATE TABLE IF NOT EXISTS \`session\` (
      id varchar(255) NOT NULL,
      expires_at timestamp(3) NOT NULL,
      token varchar(255) NOT NULL,
      created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      ip_address varchar(255),
      user_agent text,
      user_id varchar(255) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY session_token_unique (token),
      KEY session_user_id_idx (user_id),
      CONSTRAINT session_user_id_fk FOREIGN KEY (user_id) REFERENCES \`user\` (id) ON DELETE CASCADE
    )`,
  `CREATE TABLE IF NOT EXISTS \`account\` (
      id varchar(255) NOT NULL,
      account_id varchar(255) NOT NULL,
      provider_id varchar(255) NOT NULL,
      user_id varchar(255) NOT NULL,
      access_token text,
      refresh_token text,
      id_token text,
      access_token_expires_at timestamp(3) NULL,
      refresh_token_expires_at timestamp(3) NULL,
      scope text,
      password text,
      created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY account_user_id_idx (user_id),
      CONSTRAINT account_user_id_fk FOREIGN KEY (user_id) REFERENCES \`user\` (id) ON DELETE CASCADE
    )`,
  `CREATE TABLE IF NOT EXISTS \`verification\` (
      id varchar(255) NOT NULL,
      identifier varchar(255) NOT NULL,
      value text NOT NULL,
      expires_at timestamp(3) NOT NULL,
      created_at timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    )`,
  `CREATE TABLE IF NOT EXISTS \`signin_gate\` (
      email varchar(255) NOT NULL,
      expires_at timestamp(3) NOT NULL,
      PRIMARY KEY (email)
    )`,
  `CREATE TABLE IF NOT EXISTS \`play_session\` (
      id varchar(255) NOT NULL,
      user_id varchar(255) NOT NULL,
      game_slug varchar(128) NOT NULL,
      started_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      ended_at timestamp(3) NULL,
      summary text,
      outcome varchar(16) NULL,
      score int NULL,
      result_count int NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      KEY play_session_user_started_idx (user_id, started_at),
      CONSTRAINT play_session_user_id_fk FOREIGN KEY (user_id) REFERENCES \`user\` (id) ON DELETE CASCADE
    )`,
  `CREATE TABLE IF NOT EXISTS \`game_listing\` (
      slug varchar(128) NOT NULL,
      title varchar(255) NOT NULL,
      tagline text NOT NULL,
      status varchar(32) NOT NULL,
      origin varchar(255),
      poster text NOT NULL,
      controls text NOT NULL,
      soon_reason text,
      sort int NOT NULL DEFAULT 0,
      genre varchar(64),
      PRIMARY KEY (slug)
    )`,
  `CREATE TABLE IF NOT EXISTS \`saved_game\` (
      user_id varchar(255) NOT NULL,
      game_slug varchar(128) NOT NULL,
      created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (user_id, game_slug),
      CONSTRAINT saved_game_user_id_fk FOREIGN KEY (user_id) REFERENCES \`user\` (id) ON DELETE CASCADE
    )`,
];

/** Schema and the one-time catalog seed. A failed attempt is retried on the next call. */
export async function prepareDatabase(pool: mysql.Pool): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) await pool.query(statement);
  const [columns] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT 1 AS present FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_listing' AND COLUMN_NAME = 'genre' LIMIT 1`,
  );
  if (columns.length === 0) await pool.query("ALTER TABLE `game_listing` ADD COLUMN genre varchar(64) NULL");
  const [playColumns] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'play_session'`,
  );
  const playNames = new Set(playColumns.map((column) => String(column.name)));
  if (!playNames.has("outcome")) await pool.query("ALTER TABLE `play_session` ADD COLUMN outcome varchar(16) NULL");
  if (!playNames.has("score")) await pool.query("ALTER TABLE `play_session` ADD COLUMN score int NULL");
  if (!playNames.has("result_count")) await pool.query("ALTER TABLE `play_session` ADD COLUMN result_count int NOT NULL DEFAULT 0");
  await seedBuiltinGames((sql, values) => pool.query(sql, values as never));
}

export function ensureSchema(): Promise<void> {
  const pool = getPool();
  if (!pool) return Promise.resolve();
  schemaReady ??= prepareDatabase(pool).catch((error: unknown) => {
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

async function readCatalog(): Promise<GameListing[]> {
  const db = getDb();
  if (!db) return games.map(publishable);
  await ensureSchema();
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
}

const catalog = createCatalogLoader(readCatalog, CATALOG_TTL_MS);

export function invalidateCatalogCache(): void {
  catalog.invalidate();
}

export async function loadGames(): Promise<GameListing[]> {
  if (!getDb()) return games.map(publishable);
  try {
    return await catalog.load();
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

const RESULT_LIMIT = 12;

export type SessionUpdate = "saved" | "missing" | "limited";

export async function updatePlaySession(
  id: string,
  userId: string,
  patch: { summary?: string | null; outcome?: "win" | "loss" | "done" | null; score?: number | null; end?: boolean },
): Promise<SessionUpdate> {
  const db = getDb();
  if (!db) return "missing";
  await ensureSchema();
  const hasResult = patch.summary !== undefined || patch.outcome !== undefined || patch.score !== undefined;
  if (!hasResult && !patch.end) return "missing";
  const [existing] = await db
    .select({ id: schema.playSession.id, resultCount: schema.playSession.resultCount })
    .from(schema.playSession)
    .where(and(eq(schema.playSession.id, id), eq(schema.playSession.userId, userId)))
    .limit(1);
  if (!existing) return "missing";
  if (hasResult && existing.resultCount >= RESULT_LIMIT) return "limited";
  await db
    .update(schema.playSession)
    .set({
      ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch.outcome !== undefined ? { outcome: patch.outcome } : {}),
      ...(patch.score !== undefined ? { score: patch.score } : {}),
      ...(hasResult ? { resultCount: existing.resultCount + 1 } : {}),
      ...(patch.end ? { endedAt: sql`coalesce(${schema.playSession.endedAt}, now(3))` } : {}),
    })
    .where(and(eq(schema.playSession.id, id), eq(schema.playSession.userId, userId)));
  return "saved";
}

export async function savedSlugsForUser(userId: string): Promise<string[]> {
  const db = getDb();
  if (!db) return [];
  await ensureSchema();
  const rows = await db
    .select({ gameSlug: schema.savedGame.gameSlug })
    .from(schema.savedGame)
    .where(eq(schema.savedGame.userId, userId))
    .orderBy(desc(schema.savedGame.createdAt));
  return rows.map((row) => row.gameSlug);
}

export async function setSavedGame(userId: string, slug: string, saved: boolean): Promise<void> {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  if (!saved) {
    await db.delete(schema.savedGame).where(and(eq(schema.savedGame.userId, userId), eq(schema.savedGame.gameSlug, slug)));
    return;
  }
  await db
    .insert(schema.savedGame)
    .values({ userId, gameSlug: slug })
    .onDuplicateKeyUpdate({ set: { gameSlug: slug } });
}

export async function mergeSavedGames(userId: string, slugs: string[]): Promise<string[]> {
  const current = await savedSlugsForUser(userId);
  const next = [...new Set([...slugs, ...current])].slice(0, 100);
  for (const slug of next) {
    if (!current.includes(slug)) await setSavedGame(userId, slug, true);
  }
  return next;
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
    .onDuplicateKeyUpdate({ set: { expiresAt } });
}

export async function consumeSignInGate(email: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await ensureSchema();
  const [existing] = await db
    .select({ expiresAt: schema.signinGate.expiresAt })
    .from(schema.signinGate)
    .where(eq(schema.signinGate.email, email))
    .limit(1);
  const removed = await db.delete(schema.signinGate).where(eq(schema.signinGate.email, email));
  if (affected(removed) < 1) return false;
  return Boolean(existing && existing.expiresAt.getTime() > Date.now());
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
    .onDuplicateKeyUpdate({
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
  invalidateCatalogCache();
}
