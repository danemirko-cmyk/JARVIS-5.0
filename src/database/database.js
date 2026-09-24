import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../utils/config.js';

const databasePath = path.resolve(config.database.path);
const databaseDirectory = path.dirname(databasePath);

// Crea automaticamente la cartella del database
if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

// Apertura database SQLite nativo di Node.js
const db = new DatabaseSync(databasePath);

// Impostazioni SQLite
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  PRAGMA synchronous = NORMAL;
`);

export function exec(sql) {
  return db.exec(sql);
}

export function prepare(sql) {
  return db.prepare(sql);
}

export function transaction(callback) {
  db.exec('BEGIN');

  try {
    const result = callback();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // Ignora eventuali errori durante il rollback
    }

    throw error;
  }
}

export { db };

export function closeDatabase() {
  try {
    db.close();
  } catch (error) {
    console.error(
      '[DATABASE] Errore durante la chiusura:',
      error.message
    );
  }
}

export function testDatabase() {
  const result = db.prepare('SELECT 1 AS ok').get();
  return result?.ok === 1;
}

console.log(`[DATABASE] SQLite collegato: ${databasePath}`);
