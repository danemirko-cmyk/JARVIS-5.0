import { prepare } from '../database/database.js';
import { config } from '../utils/config.js';


/* =========================================================
   NORMALIZZAZIONE NUMERO
========================================================= */

function cleanPhone(value) {
  return String(value || '')
    .trim()
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}


/* =========================================================
   FORMATTA NUMERO
========================================================= */

export function formatPhone(phone) {
  const normalized =
    cleanPhone(phone);

  if (!normalized) {
    return 'numero sconosciuto';
  }

  return `+${normalized}`;
}


/* =========================================================
   NORMALIZZA NUMERO PROPRIETARIO
========================================================= */

export function normalizeOwnerPhone(phone) {
  return cleanPhone(phone);
}


/* =========================================================
   PROPRIETARIO PRINCIPALE
========================================================= */

export function getPrimaryOwner() {

  return cleanPhone(
    config.bot.ownerNumber
  );
}


/* =========================================================
   VERIFICA PROPRIETARIO
========================================================= */

export function isOwnerPhone(phone) {

  const normalized =
    cleanPhone(phone);

  if (!normalized) {
    return false;
  }


  /* Proprietario principale */

  const primaryOwner =
    cleanPhone(
      config.bot.ownerNumber
    );

  if (
    normalized === primaryOwner
  ) {
    return true;
  }


  /* Proprietari aggiuntivi */

  try {

    const row =
      prepare(`
        SELECT id
        FROM owners
        WHERE phone = ?
        LIMIT 1
      `).get(
        normalized
      );

    return Boolean(row);

  } catch (error) {

    console.error(
      '[OWNERS] Errore controllo proprietario:',
      error.message
    );

    return false;
  }
}


/* =========================================================
   AGGIUNGI PROPRIETARIO
========================================================= */

export function addOwner(
  phone,
  name = null
) {

  const normalized =
    cleanPhone(phone);

  if (!normalized) {
    return {
      success: false,
      reason: 'invalid'
    };
  }


  /* Non aggiungere due volte il principale */

  const primaryOwner =
    cleanPhone(
      config.bot.ownerNumber
    );

  if (
    normalized === primaryOwner
  ) {
    return {
      success: false,
      reason: 'primary'
    };
  }


  /* Controlla se esiste già */

  if (
    isOwnerPhone(normalized)
  ) {
    return {
      success: false,
      reason: 'exists'
    };
  }


  try {

    prepare(`
      INSERT INTO owners (
        phone,
        name,
        is_primary
      )
      VALUES (?, ?, 0)
    `).run(
      normalized,
      name || 'Proprietario'
    );

    return {
      success: true,
      phone: normalized
    };

  } catch (error) {

    console.error(
      '[OWNERS] Errore aggiunta proprietario:',
      error.message
    );

    return {
      success: false,
      reason: 'database'
    };
  }
}


/* =========================================================
   RIMUOVI PROPRIETARIO
========================================================= */

export function removeOwner(phone) {

  const normalized =
    cleanPhone(phone);

  if (!normalized) {
    return {
      success: false,
      reason: 'invalid'
    };
  }


  /* Il principale non può essere rimosso */

  const primaryOwner =
    cleanPhone(
      config.bot.ownerNumber
    );

  if (
    normalized === primaryOwner
  ) {
    return {
      success: false,
      reason: 'primary'
    };
  }


  try {

    const result =
      prepare(`
        DELETE FROM owners
        WHERE phone = ?
          AND is_primary = 0
      `).run(
        normalized
      );


    if (
      Number(result?.changes || 0) === 0
    ) {
      return {
        success: false,
        reason: 'not_found'
      };
    }


    return {
      success: true,
      phone: normalized
    };

  } catch (error) {

    console.error(
      '[OWNERS] Errore rimozione proprietario:',
      error.message
    );

    return {
      success: false,
      reason: 'database'
    };
  }
}


/* =========================================================
   LISTA PROPRIETARI
========================================================= */

export function getOwners() {

  try {

    return prepare(`
      SELECT
        phone,
        name,
        is_primary,
        created_at
      FROM owners
      ORDER BY
        is_primary DESC,
        created_at ASC
    `).all();

  } catch (error) {

    console.error(
      '[OWNERS] Errore recupero proprietari:',
      error.message
    );

    return [];
  }
}
