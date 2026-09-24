import { exec } from './database.js';

export function runMigrations() {
  exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  console.log('[DATABASE] Migrazioni controllate.');
}
