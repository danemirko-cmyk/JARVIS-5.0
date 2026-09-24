import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestWaWebVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import { Boom } from '@hapi/boom';

import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';
import qrcode from 'qrcode-terminal';
import { spawn } from 'node:child_process';

import { config } from '../utils/config.js';

import {
  logWhatsApp,
  logError
} from '../utils/logger.js';

/* =========================================================
   SESSIONE
========================================================= */

const sessionDir =
  path.resolve(
    config.whatsapp.sessionDir
  );

/* =========================================================
   LOGGER BAILEYS
========================================================= */

const baileysLogger =
  pino({
    level: 'silent'
  });

/* =========================================================
   RIAVVIO
========================================================= */

let restartScheduled =
  false;

function createRestart() {
  if (restartScheduled) {
    return;
  }

  restartScheduled = true;

  console.log('');

  logWhatsApp(
    '🔄 Riavvio automatico richiesto da WhatsApp...'
  );

  const child =
    spawn(
      process.argv[0],
      process.argv.slice(1),
      {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd(),
        env: process.env
      }
    );

  child.unref();

  setTimeout(() => {
    process.exit(0);
  }, 1500);
}

/* =========================================================
   CACHE GROUP METADATA
========================================================= */

/*
 * WhatsApp può limitare le richieste ripetute
 * a groupMetadata().
 *
 * JARVIS controlla il gruppo in più punti:
 *
 * - controllo admin
 * - mute
 * - antilink
 * - antiflood
 * - comandi admin
 * - mentions
 *
 * Senza cache possiamo effettuare diverse
 * richieste per lo stesso messaggio.
 */

const GROUP_METADATA_CACHE =
  new Map();

const GROUP_METADATA_PENDING =
  new Map();

/*
 * Durata cache:
 * 5 secondi.
 *
 * È abbastanza breve per mantenere
 * i dati del gruppo aggiornati,
 * ma evita richieste duplicate.
 */

const GROUP_METADATA_TTL =
  5000;

function normalizeGroupJid(
  jid
) {
  return String(
    jid || ''
  )
    .trim()
    .toLowerCase();
}

function invalidateGroupMetadata(
  groupJid
) {
  if (!groupJid) {
    return;
  }

  GROUP_METADATA_CACHE.delete(
    normalizeGroupJid(
      groupJid
    )
  );
}

function clearGroupMetadataCache() {
  GROUP_METADATA_CACHE.clear();
  GROUP_METADATA_PENDING.clear();
}

/**
 * Installa una versione cacheata di
 * sock.groupMetadata().
 */
function installGroupMetadataCache(
  sock
) {
  if (
    !sock ||
    typeof sock.groupMetadata !==
      'function'
  ) {
    return;
  }

  /*
   * Evitiamo di installare la cache
   * più di una volta sullo stesso socket.
   */

  if (
    sock.__jarvisGroupMetadataCache
  ) {
    return;
  }

  const original =
    sock.groupMetadata.bind(sock);

  sock.__jarvisOriginalGroupMetadata =
    original;

  sock.groupMetadata =
    async function cachedGroupMetadata(
      groupJid
    ) {
      const key =
        normalizeGroupJid(
          groupJid
        );

      if (
        !key ||
        !key.endsWith('@g.us')
      ) {
        return original(
          groupJid
        );
      }

      const now =
        Date.now();

      /*
       * CACHE VALIDA
       */

      const cached =
        GROUP_METADATA_CACHE.get(
          key
        );

      if (
        cached &&
        now - cached.timestamp <
          GROUP_METADATA_TTL
      ) {
        return cached.metadata;
      }

      /*
       * RICHIESTA GIÀ IN CORSO
       *
       * Se 3 funzioni chiedono
       * contemporaneamente lo stesso
       * gruppo, facciamo UNA sola
       * richiesta a WhatsApp.
       */

      const pending =
        GROUP_METADATA_PENDING.get(
          key
        );

      if (pending) {
        return pending;
      }

      /*
       * NUOVA RICHIESTA
       */

      const request =
        original(groupJid)
          .then(metadata => {

            GROUP_METADATA_CACHE.set(
              key,
              {
                metadata,
                timestamp: Date.now()
              }
            );

            return metadata;
          })
          .catch(error => {

            /*
             * Non conserviamo gli errori
             * nella cache.
             */

            throw error;

          })
          .finally(() => {

            GROUP_METADATA_PENDING.delete(
              key
            );
          });

      GROUP_METADATA_PENDING.set(
        key,
        request
      );

      return request;
    };

  /*
   * Funzioni di supporto disponibili
   * anche per altri moduli.
   */

  sock.clearGroupMetadataCache =
    clearGroupMetadataCache;

  sock.invalidateGroupMetadata =
    invalidateGroupMetadata;

  sock.__jarvisGroupMetadataCache =
    true;
}

/* =========================================================
   CREAZIONE SOCKET
========================================================= */

async function createSocket(
  state
) {
  logWhatsApp(
    'Recupero versione WhatsApp Web corrente...'
  );

  const latest =
    await fetchLatestWaWebVersion();

  if (!latest?.version) {
    throw new Error(
      'Impossibile recuperare la versione corrente di WhatsApp Web.'
    );
  }

  const version =
    latest.version;

  logWhatsApp(
    `Versione WA Web: ${version.join('.')}`
  );

  logWhatsApp(
    `Versione dichiarata aggiornata: ${
      latest.isLatest
        ? 'SI'
        : 'NO'
    }`
  );

  const sock =
    makeWASocket({
      auth: state,

      logger:
        baileysLogger,

      printQRInTerminal:
        false,

      browser:
        Browsers.ubuntu(
          'JARVIS 5.0'
        ),

      version,

      markOnlineOnConnect:
        false,

      connectTimeoutMs:
        60000,

      defaultQueryTimeoutMs:
        60000,

      generateHighQualityLinkPreview:
        false,

      syncFullHistory:
        false
    });

  /*
   * IMPORTANTISSIMO:
   * installiamo la cache SUBITO
   * dopo la creazione del socket.
   *
   * Da questo momento qualsiasi
   * modulo che utilizza:
   *
   * sock.groupMetadata(...)
   *
   * passa attraverso la cache.
   */

  installGroupMetadataCache(
    sock
  );

  return sock;
}

/* =========================================================
   QR
========================================================= */

function showQR(qr) {
  console.log('');

  console.log(
    '╔══════════════════════════════════════╗'
  );

  console.log(
    '║              QR CODE                ║'
  );

  console.log(
    '╚══════════════════════════════════════╝'
  );

  console.log('');

  qrcode.generate(
    qr,
    {
      small: true
    }
  );

  console.log('');

  console.log(
    '📱 Sul telefono del numero JARVIS:'
  );

  console.log(
    'WhatsApp → Impostazioni → Dispositivi collegati'
  );

  console.log(
    '→ Collega un dispositivo'
  );

  console.log(
    '→ Scansiona questo QR'
  );

  console.log('');
}

/* =========================================================
   START WHATSAPP
========================================================= */

export async function startWhatsApp() {

  if (
    !fs.existsSync(
      sessionDir
    )
  ) {
    fs.mkdirSync(
      sessionDir,
      {
        recursive: true
      }
    );
  }

  const {
    state,
    saveCreds
  } =
    await useMultiFileAuthState(
      sessionDir
    );

  const registered =
    Boolean(
      state.creds.registered
    );

  console.log('');

  if (!registered) {

    console.log(
      '╔══════════════════════════════════════╗'
    );

    console.log(
      '║       COLLEGAMENTO WHATSAPP         ║'
    );

    console.log(
      '╠══════════════════════════════════════╣'
    );

    console.log(
      '║                                      ║'
    );

    console.log(
      '║          📱 MODALITÀ QR             ║'
    );

    console.log(
      '║                                      ║'
    );

    console.log(
      '╚══════════════════════════════════════╝'
    );

    console.log('');
  }

  logWhatsApp(
    registered
      ? 'Sessione WhatsApp trovata.'
      : 'Nessuna sessione trovata: verrà mostrato il QR.'
  );

  let sock;

  try {

    sock =
      await createSocket(
        state
      );

  } catch (error) {

    logError(
      'Impossibile creare il socket WhatsApp',
      error
    );

    throw error;
  }

  sock.ev.on(
    'creds.update',
    saveCreds
  );

  let qrShown =
    false;

  let connectionOpened =
    false;

  let closing =
    false;

  /* =======================================================
     CONNECTION UPDATE
  ======================================================= */

  sock.ev.on(
    'connection.update',
    async update => {

      const {
        connection,
        lastDisconnect,
        qr
      } = update;

      if (connection) {

        logWhatsApp(
          `Stato connessione: ${connection}`
        );
      }

      /* =====================================================
         QR
      ===================================================== */

      if (
        !registered &&
        qr &&
        !qrShown
      ) {
        qrShown = true;

        showQR(qr);
      }

      /* =====================================================
         OPEN
      ===================================================== */

      if (
        connection === 'open'
      ) {

        connectionOpened =
          true;

        console.log('');

        console.log(
          '╔══════════════════════════════════════╗'
        );

        console.log(
          '║       J.A.R.V.I.S 5.0 ONLINE       ║'
        );

        console.log(
          '╚══════════════════════════════════════╝'
        );

        console.log('');

        logWhatsApp(
          '✅ Connessione stabilita.'
        );

        logWhatsApp(
          '🤖 JARVIS 5.0 online.'
        );

        console.log('');
      }

      /* =====================================================
         CLOSE
      ===================================================== */

      if (
        connection !== 'close' ||
        closing
      ) {
        return;
      }

      closing =
        true;

      /*
       * Pulizia cache quando il socket
       * viene chiuso.
       */

      clearGroupMetadataCache();

      const error =
        lastDisconnect?.error;

      const statusCode =
        error instanceof Boom
          ? error.output?.statusCode
          : error?.output?.statusCode;

      const message =
        error?.message ||
        String(
          error || ''
        );

      console.log('');

      logWhatsApp(
        '❌ Connessione chiusa.'
      );

      logWhatsApp(
        `Codice: ${
          statusCode ??
          'sconosciuto'
        }`
      );

      if (message) {

        logWhatsApp(
          `Motivo: ${message}`
        );
      }

      /* =====================================================
         RESTART REQUIRED
      ===================================================== */

      if (
        statusCode ===
        DisconnectReason.restartRequired
      ) {

        console.log('');

        logWhatsApp(
          '🔄 WhatsApp richiede il riavvio della connessione.'
        );

        logWhatsApp(
          '💾 Credenziali salvate.'
        );

        logWhatsApp(
          '🔁 Riavvio JARVIS in corso...'
        );

        createRestart();

        return;
      }

      /* =====================================================
         LOGOUT
      ===================================================== */

      if (
        statusCode ===
        DisconnectReason.loggedOut
      ) {

        console.log('');

        logWhatsApp(
          '⚠️ Sessione WhatsApp disconnessa.'
        );

        logWhatsApp(
          '📱 È necessario effettuare nuovamente il collegamento.'
        );

        return;
      }

      /* =====================================================
         CONNECTION REPLACED
      ===================================================== */

      if (
        statusCode ===
        DisconnectReason.connectionReplaced
      ) {

        console.log('');

        logWhatsApp(
          '⚠️ Connessione sostituita (440).'
        );

        logWhatsApp(
          '🛑 Nessun riavvio automatico.'
        );

        logWhatsApp(
          '📱 Controlla i dispositivi collegati su WhatsApp.'
        );

        return;
      }

      /* =====================================================
         ALTRI ERRORI
      ===================================================== */

      console.log('');

      logWhatsApp(
        '🔌 Connessione persa.'
      );

      logWhatsApp(
        '🛑 JARVIS verrà arrestato per evitare socket duplicati.'
      );

      setTimeout(() => {

        process.exit(
          statusCode || 1
        );

      }, 1500);
    }
  );

  return sock;
}
