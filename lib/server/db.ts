import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config";

/** Base SQLite des comptes, des sessions et des paiements. Une seule connexion pour tout le processus. */
const globalForDb = globalThis as unknown as { __viceclipDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (globalForDb.__viceclipDb) return globalForDb.__viceclipDb;
  fs.mkdirSync(config.dbDir, { recursive: true });
  const database = new DatabaseSync(path.join(config.dbDir, "viceclip.db"));
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      plan TEXT,
      credits INTEGER NOT NULL DEFAULT 0,
      period_end INTEGER,
      subscription_status TEXT,
      payment_failed INTEGER NOT NULL DEFAULT 0,
      mollie_customer_id TEXT,
      mollie_subscription_id TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      credited INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_jobs (
      job_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS user_jobs_by_user ON user_jobs(user_id, created_at);
  `);
  globalForDb.__viceclipDb = database;
  return database;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
  plan: string | null;
  credits: number;
  period_end: number | null;
  subscription_status: string | null;
  payment_failed: number;
  mollie_customer_id: string | null;
  mollie_subscription_id: string | null;
}
