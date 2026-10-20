import { boolean, index, int, mysqlTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/mysql-core";

const when = (name: string) => timestamp(name, { fsp: 3 }).notNull().defaultNow();

export const user = mysqlTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  over13: boolean("over13").notNull().default(false),
  createdAt: when("created_at"),
  updatedAt: when("updated_at"),
});

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: when("created_at"),
    updatedAt: when("updated_at"),
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: when("created_at"),
    updatedAt: when("updated_at"),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 }).defaultNow(),
});

export const signinGate = mysqlTable("signin_gate", {
  email: varchar("email", { length: 255 }).primaryKey(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
});

export const playSession = mysqlTable(
  "play_session",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gameSlug: varchar("game_slug", { length: 128 }).notNull(),
    startedAt: when("started_at"),
    endedAt: timestamp("ended_at", { fsp: 3 }),
    summary: text("summary"),
    outcome: varchar("outcome", { length: 16 }),
    score: int("score"),
    resultCount: int("result_count").notNull().default(0),
  },
  (table) => [index("play_session_user_started_idx").on(table.userId, table.startedAt)],
);

export const savedGame = mysqlTable(
  "saved_game",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gameSlug: varchar("game_slug", { length: 128 }).notNull(),
    createdAt: when("created_at"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.gameSlug] })],
);

export const gameListing = mysqlTable("game_listing", {
  slug: varchar("slug", { length: 128 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 64 }),
  tagline: text("tagline").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  origin: varchar("origin", { length: 255 }),
  poster: text("poster").notNull(),
  controls: text("controls").notNull(),
  soonReason: text("soon_reason"),
  sort: int("sort").notNull().default(0),
});
