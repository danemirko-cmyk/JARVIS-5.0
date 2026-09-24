/* =========================================================
   JARVIS 5.0
   CONFIG
   ========================================================= */

import 'dotenv/config';

/* =========================================================
   HELPERS
   ========================================================= */

function env(name, fallback = '') {
  const value = process.env[name];

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return fallback;
  }

  return value;
}

function envBoolean(name, fallback = false) {
  const value = env(name, '');

  if (!value) {
    return fallback;
  }

  return [
    'true',
    '1',
    'yes',
    'on'
  ].includes(value.toLowerCase());
}

function cleanNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

/* =========================================================
   CONFIG
   ========================================================= */

/*
 * IMPORTANTE:
 * NON usare PREFIX perché Termux usa già una variabile
 * di sistema chiamata PREFIX=/data/data/com.termux/files/usr
 *
 * JARVIS usa esclusivamente BOT_PREFIX.
 */

const prefix = env(
  'BOT_PREFIX',
  '.'
);

const ownerNumber = cleanNumber(
  env(
    'OWNER_NUMBER',
    ''
  )
);

const sessionDir = env(
  'SESSION_DIR',
  './auth_info'
);

const databasePath = env(
  'DATABASE_PATH',
  env(
    'DB_PATH',
    './jarvis.db'
  )
);

const groqApiKey = env(
  'GROQ_API_KEY',
  env(
    'GROQ_APIKEY',
    ''
  )
);

const groqModel = env(
  'GROQ_MODEL',
  'openai/gpt-oss-120b'
);

/* =========================================================
   EXPORT
   ========================================================= */

export const config = {

  /* -------------------------------------------------------
     BOT
     ------------------------------------------------------- */

  bot: {
    name: env(
      'BOT_NAME',
      'J.A.R.V.I.S 5.0'
    ),

    version: '5.0.0',

    prefix,

    language: env(
      'BOT_LANGUAGE',
      'it'
    ),

    ownerNumber
  },

  /* -------------------------------------------------------
     OWNER
     ------------------------------------------------------- */

  owner: {
    number: ownerNumber,

    name: env(
      'OWNER_NAME',
      'Dada'
    )
  },

  /* -------------------------------------------------------
     WHATSAPP
     ------------------------------------------------------- */

  whatsapp: {
    sessionDir,

    printQRInTerminal: envBoolean(
      'PRINT_QR',
      true
    ),

    browserName: [
      'JARVIS',
      '5.0.0',
      'Android'
    ]
  },

  /* -------------------------------------------------------
     DATABASE
     ------------------------------------------------------- */

  database: {
    path: databasePath
  },

  /* -------------------------------------------------------
     AI / GROQ
     ------------------------------------------------------- */

  ai: {
    provider: 'groq',

    apiKey: groqApiKey,

    groqApiKey,

    model: groqModel,

    temperature: Number(
      env(
        'AI_TEMPERATURE',
        '0.7'
      )
    ),

    maxTokens: Number(
      env(
        'AI_MAX_TOKENS',
        '2048'
      )
    )
  },

  /* -------------------------------------------------------
     SERVER
     ------------------------------------------------------- */

  server: {
    host: env(
      'HOST',
      '0.0.0.0'
    ),

    port: Number(
      env(
        'PORT',
        '3000'
      )
    )
  },

  /* -------------------------------------------------------
     ENVIRONMENT
     ------------------------------------------------------- */

  env: env(
    'NODE_ENV',
    'production'
  ),

  development:
    env(
      'NODE_ENV',
      'production'
    ) === 'development'
};

/* =========================================================
   DEFAULT
   ========================================================= */

export default config;
