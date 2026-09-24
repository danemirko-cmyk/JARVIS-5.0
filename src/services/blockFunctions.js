import {
  exec,
  prepare
} from '../database/database.js';

const TWO_HOURS = 2 * 60 * 60 * 1000;

// ============================================================
// DATABASE
// ============================================================

exec(`
  CREATE TABLE IF NOT EXISTS group_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_jid TEXT NOT NULL,
    user_jid TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'manual',
    reason TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    UNIQUE(group_jid, user_jid)
  );

  CREATE INDEX IF NOT EXISTS idx_group_blocks_group
  ON group_blocks(group_jid);

  CREATE INDEX IF NOT EXISTS idx_group_blocks_user
  ON group_blocks(group_jid, user_jid);
`);

// ============================================================
// UTILS
// ============================================================

function normalizeJid(jid) {
  if (!jid) return null;

  return String(jid)
    .trim()
    .replace(/:[0-9]+(?=@)/, '');
}

function cleanupExpiredBlocks(groupJid = null) {

  const now = Date.now();

  if (groupJid) {
    prepare(`
      DELETE FROM group_blocks
      WHERE group_jid = ?
        AND expires_at IS NOT NULL
        AND expires_at <= ?
    `).run(
      groupJid,
      now
    );

    return;
  }

  prepare(`
    DELETE FROM group_blocks
    WHERE expires_at IS NOT NULL
      AND expires_at <= ?
  `).run(now);
}

// ============================================================
// BLOCK
// ============================================================

export function blockUser(
  groupJid,
  userJid,
  duration = null,
  type = 'manual',
  reason = null
) {

  groupJid = normalizeJid(groupJid);
  userJid = normalizeJid(userJid);

  if (!groupJid || !userJid) {
    throw new Error(
      'groupJid e userJid sono obbligatori.'
    );
  }

  cleanupExpiredBlocks(groupJid);

  let expiresAt = null;

  if (duration) {
    expiresAt =
      Date.now() + duration;
  }

  prepare(`
    INSERT INTO group_blocks
      (
        group_jid,
        user_jid,
        type,
        reason,
        created_at,
        expires_at
      )
    VALUES
      (?, ?, ?, ?, ?, ?)
    ON CONFLICT(group_jid, user_jid)
    DO UPDATE SET
      type = excluded.type,
      reason = excluded.reason,
      created_at = excluded.created_at,
      expires_at = excluded.expires_at
  `).run(
    groupJid,
    userJid,
    type,
    reason,
    Date.now(),
    expiresAt
  );

  return true;
}

// ============================================================
// AUTO BLOCK 2 ORE
// ============================================================

export function blockUserForTwoHours(
  groupJid,
  userJid,
  reason = null
) {

  return blockUser(
    groupJid,
    userJid,
    TWO_HOURS,
    'automatic',
    reason
  );
}

// ============================================================
// UNBLOCK
// ============================================================

export function unblockUser(
  groupJid,
  userJid
) {

  groupJid = normalizeJid(groupJid);
  userJid = normalizeJid(userJid);

  if (!groupJid || !userJid) {
    return false;
  }

  const result =
    prepare(`
      DELETE FROM group_blocks
      WHERE group_jid = ?
        AND user_jid = ?
    `).run(
      groupJid,
      userJid
    );

  return result.changes > 0;
}

// ============================================================
// CHECK BLOCK
// ============================================================

export function isUserBlocked(
  groupJid,
  userJid
) {

  groupJid = normalizeJid(groupJid);
  userJid = normalizeJid(userJid);

  if (!groupJid || !userJid) {
    return false;
  }

  cleanupExpiredBlocks(groupJid);

  const row =
    prepare(`
      SELECT
        *
      FROM group_blocks
      WHERE group_jid = ?
        AND user_jid = ?
      LIMIT 1
    `).get(
      groupJid,
      userJid
    );

  if (!row) {
    return false;
  }

  return row;
}

// ============================================================
// BLOCKLIST
// ============================================================

export function getBlockedUsers(
  groupJid
) {

  groupJid = normalizeJid(groupJid);

  if (!groupJid) {
    return [];
  }

  cleanupExpiredBlocks(groupJid);

  return prepare(`
    SELECT
      id,
      group_jid,
      user_jid,
      type,
      reason,
      created_at,
      expires_at
    FROM group_blocks
    WHERE group_jid = ?
    ORDER BY created_at DESC
  `).all(
    groupJid
  );
}

// ============================================================
// CLEANUP GLOBALE
// ============================================================

export function cleanupExpiredBlocksGlobal() {
  cleanupExpiredBlocks();
}

// ============================================================
// COSTANTI
// ============================================================

export {
  TWO_HOURS
};
