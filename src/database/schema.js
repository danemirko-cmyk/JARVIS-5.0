import { exec } from './database.js';
import { config } from '../utils/config.js';

export function initializeSchema() {
  exec(`
    PRAGMA foreign_keys = ON;

    -- =====================================================
    -- OWNERS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      name TEXT,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- =====================================================
    -- USERS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      name TEXT,
      instagram TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      coins INTEGER NOT NULL DEFAULT 0,
      messages INTEGER NOT NULL DEFAULT 0,
      blasphemy_count INTEGER NOT NULL DEFAULT 0,
      warns INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_users_phone
      ON users(phone);

    -- =====================================================
    -- GROUPS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT NOT NULL UNIQUE,
      name TEXT,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_groups_jid
      ON groups(jid);

    -- =====================================================
    -- GROUP SETTINGS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS group_settings (
      group_id INTEGER PRIMARY KEY,

      welcome INTEGER NOT NULL DEFAULT 0,
      goodbye INTEGER NOT NULL DEFAULT 0,

      antilink INTEGER NOT NULL DEFAULT 0,
      antilink_ig INTEGER NOT NULL DEFAULT 0,
      antilink_tiktok INTEGER NOT NULL DEFAULT 0,

      antiflood INTEGER NOT NULL DEFAULT 0,

      xp_enabled INTEGER NOT NULL DEFAULT 1,
      economy_enabled INTEGER NOT NULL DEFAULT 1,
      ai_enabled INTEGER NOT NULL DEFAULT 1,
      memory_enabled INTEGER NOT NULL DEFAULT 1,

      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- WARNINGS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      moderator_phone TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_warnings_user_group
      ON warnings(user_id, group_id);

    -- =====================================================
    -- ECONOMY
    -- =====================================================

    CREATE TABLE IF NOT EXISTS economy (
      user_id INTEGER PRIMARY KEY,
      balance INTEGER NOT NULL DEFAULT 0,
      last_daily INTEGER NOT NULL DEFAULT 0,
      last_work INTEGER NOT NULL DEFAULT 0,
      last_rob INTEGER NOT NULL DEFAULT 0,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- BANK
    -- =====================================================

    CREATE TABLE IF NOT EXISTS bank (
      user_id INTEGER PRIMARY KEY,
      balance INTEGER NOT NULL DEFAULT 0,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- TRANSACTIONS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (from_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

      FOREIGN KEY (to_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_created
      ON transactions(created_at);

    -- =====================================================
    -- XP
    -- =====================================================

    CREATE TABLE IF NOT EXISTS xp (
      user_id INTEGER PRIMARY KEY,
      total_xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- ACHIEVEMENTS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_key TEXT NOT NULL,
      unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),

      UNIQUE(user_id, achievement_key),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_achievements_user
      ON achievements(user_id);

    -- =====================================================
    -- MEMORIES
    -- =====================================================

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      memory TEXT NOT NULL,
      importance INTEGER NOT NULL DEFAULT 1,
      source TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_memories_user
      ON memories(user_id);

    -- =====================================================
    -- MESSAGES
    -- =====================================================

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      group_id INTEGER,
      message_id TEXT,
      message_type TEXT,
      text TEXT,
      is_command INTEGER NOT NULL DEFAULT 0,
      is_bot INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

      FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_user
      ON messages(user_id);

    CREATE INDEX IF NOT EXISTS idx_messages_group
      ON messages(group_id);

    CREATE INDEX IF NOT EXISTS idx_messages_created
      ON messages(created_at);

    -- =====================================================
    -- STATS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS stats (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- =====================================================
    -- CHAT SESSIONS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS chat_sessions (
      user_id INTEGER PRIMARY KEY,
      started_at INTEGER NOT NULL DEFAULT (unixepoch()),
      last_message_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- USER SETTINGS
    -- =====================================================

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      ai_enabled INTEGER NOT NULL DEFAULT 1,
      memory_enabled INTEGER NOT NULL DEFAULT 1,
      xp_enabled INTEGER NOT NULL DEFAULT 1,
      economy_enabled INTEGER NOT NULL DEFAULT 1,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- INSTAGRAM
    -- =====================================================

    CREATE TABLE IF NOT EXISTS instagram (
      user_id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    -- =====================================================
    -- INITIAL STATS
    -- =====================================================

    INSERT OR IGNORE INTO stats (key, value)
    VALUES
      ('messages_total', 0),
      ('commands_total', 0),
      ('users_total', 0),
      ('groups_total', 0),
      ('ai_requests', 0),
      ('stickers_created', 0),
      ('images_generated', 0);

    -- =====================================================
    -- PRIMARY OWNER
    -- =====================================================

    INSERT OR IGNORE INTO owners (
      phone,
      name,
      is_primary
    )
    VALUES (
      '${config.bot.ownerNumber}',
      'Dada',
      1
    );
  `);
}
