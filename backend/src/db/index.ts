import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const databasePath = process.env.DATABASE_URL ?? path.join(dataDir, "listophe.db");
const sqlite = new Database(databasePath);
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export function ensureSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE TABLE IF NOT EXISTS rows (
      id TEXT PRIMARY KEY NOT NULL,
      list_id TEXT NOT NULL,
      text TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS rows_list_position_idx ON rows(list_id, position);
  `);
}
