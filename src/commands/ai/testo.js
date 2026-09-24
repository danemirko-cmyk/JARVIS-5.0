import { findLyrics } from '../../services/lyrics.js';

function formatLyrics(result, query) {
  const title = result.trackName || query;
  const artist = result.artistName || 'Artista sconosciuto';

  let text =
    '🎵 *JARVIS TESTO*\n\n' +
    `🎶 *${title}*\n` +
    `👤 ${artist}\n`;

  if (result.albumName) {
    text += `💿 ${result.albumName}\n`;
  }

  text += '\n';

  if (result.instrumental) {
    text += '🎹 Questo brano è strumentale.';
    return text;
  }

  if (!result.plainLyrics) {
    text += '❌ Testo non disponibile su LRCLIB.';
    return text;
  }

  // Evita di inviare automaticamente testi completi protetti.
  const lines = result.plainLyrics
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const excerpt = lines
    .slice(0, 9999)
    .join('\n');

  text +=
    '📝 *Estratto:*\n\n' +
    `${excerpt}\n\n` +
    '🔗 Testo completo disponibile su LRCLIB.';

  return text;
}

async function executeTesto({ sock, message, args }) {
  const jid = message?.key?.remoteJid;

  if (!jid) {
    console.error('❌ .testo: JID non disponibile.');
    return;
  }

  const query = Array.isArray(args)
    ? args.join(' ').trim()
    : String(args || '').trim();

  if (!query) {
    await sock.sendMessage(
      jid,
      {
        text:
          '🎵 *JARVIS TESTO*\n\n' +
          'Usa:\n' +
          '`.testo nome della canzone`\n\n' +
          'Esempio:\n' +
          '`.testo Imagine Dragons Believer`'
      },
      { quoted: message }
    );

    return;
  }

  try {
    await sock.sendMessage(
      jid,
      {
        text:
          '🔎 *JARVIS TESTO*\n\n' +
          `Cerco *${query}*...`
      },
      { quoted: message }
    );

    const result = await findLyrics(query);

    const response = formatLyrics(result, query);

    await sock.sendMessage(
      jid,
      {
        text: response
      },
      { quoted: message }
    );

    console.log(
      `[TESTO] Trovato: ${result.trackName} - ${result.artistName}`
    );

  } catch (error) {
    console.error(
      '❌ Errore .testo:',
      error?.message || error
    );

    await sock.sendMessage(
      jid,
      {
        text:
          '❌ *JARVIS TESTO*\n\n' +
          'Non sono riuscito a trovare il brano.\n\n' +
          `Motivo: ${error?.message || 'errore sconosciuto'}`
      },
      { quoted: message }
    );
  }
}

export function registerTestoCommand(registerCommand) {
  registerCommand('testo', executeTesto);
}
