import type { Pool, QueryOptions } from "mysql2/promise";

/** Reads and writes share this deadline. MySQL's max_execution_time does not cover writes. */
export const STATEMENT_TIMEOUT_MS = 5_000;

export const SESSION_LIMITS_SQL =
  "SET SESSION max_execution_time = 5000, innodb_lock_wait_timeout = 5";

type QueryCallback = (error: Error | null, rows?: unknown, fields?: unknown) => void;

type GuardedConnection = {
  query(options: QueryOptions, callback: QueryCallback): unknown;
  execute(options: QueryOptions, callback: QueryCallback): unknown;
  release(): void;
  destroy(): void;
};

type CorePool = {
  getConnection(callback: (error: Error | null, connection?: GuardedConnection) => void): void;
};

export function statementOptions(sql: string | QueryOptions, values?: unknown): QueryOptions {
  if (typeof sql === "string") {
    return values === undefined
      ? { sql, timeout: STATEMENT_TIMEOUT_MS }
      : { sql, values: values as QueryOptions["values"], timeout: STATEMENT_TIMEOUT_MS };
  }
  const merged = values === undefined ? sql.values : (sql.values ?? (values as QueryOptions["values"]));
  return {
    ...sql,
    timeout: STATEMENT_TIMEOUT_MS,
    ...(merged === undefined ? {} : { values: merged }),
  };
}

export function isStatementTimeout(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error
    && (error as { code?: string }).code === "PROTOCOL_SEQUENCE_TIMEOUT";
}

export function armConnectionWait(
  getConnection: CorePool["getConnection"],
  timeoutMs: number,
): CorePool["getConnection"] {
  return (callback) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      const error = new Error("timed out waiting for a database connection");
      error.name = "ConnectionWaitTimeout";
      callback(error);
    }, timeoutMs);
    getConnection((error, connection) => {
      if (settled) {
        connection?.release();
        return;
      }
      settled = true;
      clearTimeout(timer);
      callback(error, connection);
    });
  };
}

function run(
  core: CorePool,
  method: "query" | "execute",
  sql: string | QueryOptions,
  values?: unknown,
): Promise<unknown> {
  const options = statementOptions(sql, values);
  return new Promise((resolve, reject) => {
    core.getConnection((error, connection) => {
      if (error || !connection) {
        reject(error ?? new Error("database connection missing"));
        return;
      }
      let settled = false;
      const finish: QueryCallback = (queryError, rows, fields) => {
        if (settled) return;
        settled = true;
        // The client timeout does not stop the server statement. Drop the
        // connection so the pool slot is not held until the write finishes.
        if (queryError && isStatementTimeout(queryError)) {
          connection.destroy();
          reject(queryError);
          return;
        }
        connection.release();
        if (queryError) reject(queryError);
        else resolve([rows, fields]);
      };
      try {
        connection[method](options, finish);
      } catch (caught) {
        finish(caught instanceof Error ? caught : new Error("database query failed"));
      }
    });
  });
}

export function installPoolGuards(pool: Pool): void {
  const core = (pool as unknown as { pool: CorePool }).pool;
  core.getConnection = armConnectionWait(core.getConnection.bind(core), STATEMENT_TIMEOUT_MS);
  const target = pool as unknown as {
    query(sql: string | QueryOptions, values?: unknown): Promise<unknown>;
    execute(sql: string | QueryOptions, values?: unknown): Promise<unknown>;
  };
  target.query = (sql, values) => run(core, "query", sql, values);
  target.execute = (sql, values) => run(core, "execute", sql, values);
}
