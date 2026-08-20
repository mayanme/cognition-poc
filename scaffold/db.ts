import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export const DB_PATH = process.env.DEMO_DB_PATH ?? path.join(process.cwd(), 'db', 'demo.sqlite');
export const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  }
  return db;
}

export function isSeeded(): boolean {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  return row.count > 0;
}
