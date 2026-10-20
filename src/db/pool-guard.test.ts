import { afterEach, expect, test, vi } from "vitest";
import type { QueryOptions } from "mysql2/promise";
import { armConnectionWait, installPoolGuards, isStatementTimeout, STATEMENT_TIMEOUT_MS, statementOptions } from "./pool-guard";

afterEach(() => {
  vi.useRealTimers();
});

test("every statement gets a timeout, and drizzle's extra options stay", () => {
  expect(statementOptions("UPDATE game_listing SET title = ?", ["Velocity"])).toMatchObject({
    sql: "UPDATE game_listing SET title = ?",
    values: ["Velocity"],
    timeout: STATEMENT_TIMEOUT_MS,
  });
  expect(statementOptions({ sql: "SELECT 1", rowsAsArray: true }, [1])).toMatchObject({
    sql: "SELECT 1",
    rowsAsArray: true,
    values: [1],
    timeout: STATEMENT_TIMEOUT_MS,
  });
});

type GuardedPool = {
  query(sql: string): Promise<unknown>;
  execute(sql: string): Promise<unknown>;
  pool: {
    getConnection(callback: (error: Error | null, connection?: unknown) => void): void;
  };
};

test("a timed-out statement drops its connection instead of returning it to the pool", async () => {
  let destroyed = 0;
  let released = 0;
  const pool: GuardedPool = {
    pool: {
      getConnection(callback) {
        callback(null, {
          query(_options: QueryOptions, done: (error: Error | null) => void) {
            const error = new Error("Query inactivity timeout") as Error & { code: string };
            error.code = "PROTOCOL_SEQUENCE_TIMEOUT";
            done(error);
          },
          execute() {
            throw new Error("not used");
          },
          release() {
            released += 1;
          },
          destroy() {
            destroyed += 1;
          },
        });
      },
    },
    query() {
      throw new Error("unwrapped");
    },
    execute() {
      throw new Error("unwrapped");
    },
  };
  installPoolGuards(pool as never);
  await expect(pool.query("UPDATE game_listing SET title = 'x'")).rejects.toThrow(/timeout/);
  expect(isStatementTimeout(Object.assign(new Error("timeout"), { code: "PROTOCOL_SEQUENCE_TIMEOUT" }))).toBe(true);
  expect(destroyed).toBe(1);
  expect(released).toBe(0);
});

test("waiting for a free connection gives up", async () => {
  vi.useFakeTimers();
  const pool: GuardedPool = {
    pool: {
      getConnection() {
        return undefined;
      },
    },
    query() {
      throw new Error("unwrapped");
    },
    execute() {
      throw new Error("unwrapped");
    },
  };
  installPoolGuards(pool as never);
  const pending = pool.query("SELECT 1");
  const failure = expect(pending).rejects.toThrow(/timed out waiting for a database connection/);
  await vi.advanceTimersByTimeAsync(STATEMENT_TIMEOUT_MS);
  await failure;
});

test("a connection that arrives after the wait has given up is released", () => {
  vi.useFakeTimers();
  const arrived: Array<(error: Error | null, connection?: { release(): void }) => void> = [];
  let released = 0;
  const wrapped = armConnectionWait((callback) => {
    arrived.push((error, connection) => callback(error, connection as never));
  }, STATEMENT_TIMEOUT_MS);
  const seen: unknown[] = [];
  wrapped((error) => {
    seen.push(error);
  });
  vi.advanceTimersByTime(STATEMENT_TIMEOUT_MS);
  expect(seen).toHaveLength(1);
  expect((seen[0] as Error).name).toBe("ConnectionWaitTimeout");
  arrived[0]?.(null, { release() { released += 1; } });
  expect(released).toBe(1);
});
