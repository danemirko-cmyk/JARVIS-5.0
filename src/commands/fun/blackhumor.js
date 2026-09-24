const BLACK_HUMOR = [
  'ha così tanta sfortuna che anche il caricabatterie smette di funzionare quando lo usa.',
  'ha aperto Google Maps e anche lui ha detto “non lo so”.',
  'il suo futuro è talmente incerto che pure JARVIS ha messo il punto interrogativo.',
  'quando entra in una stanza, anche il Wi-Fi perde il segnale.',
  'ha cercato la motivazione e gli è comparso “pagina non trovata”.',
  'la sua produttività è attualmente in modalità aereo.',
  'ha talmente poco senso dell’orientamento che riesce a perdersi dentro WhatsApp.',
  'il suo piano per oggi era non avere un piano. Missione completata.',
  'JARVIS ha analizzato la sua situazione e ha deciso di non coinvolgere gli avvocati.',
  'ha fatto una scelta intelligente. Purtroppo era quella sbagliata.',
  'il suo cervello ha installato un aggiornamento e ora è fermo al 3%.',
  'la sua fortuna è così bassa che una moneta lanciata da lui atterra di lato.'
];

export function registerBlackhumorCommand(registerCommand) {
  registerCommand(
    'blackhumor',
    async ({ sock, chat, message }) => {
      try {
        const context =
          message?.message?.extendedTextMessage?.contextInfo;

        const mentioned =
          context?.mentionedJid || [];

        const target =
          mentioned[0] ||
          context?.participant;

        if (!target) {
          await sock.sendMessage(
            chat,
            {
              text:
                '💀 Usa `.blackhumor @utente`!'
            },
            { quoted: message }
          );
          return;
        }

        const joke =
          BLACK_HUMOR[
            Math.floor(
              Math.random() *
              BLACK_HUMOR.length
            )
          ];

        const number =
          String(target)
            .split('@')[0]
            .split(':')[0];

        await sock.sendMessage(
          chat,
          {
            text:
`💀 *BLACK HUMOR JARVIS*

👤 @${number}

${joke}

☠️ *È tutto ironico.*`,
            mentions: [target]
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[BLACKHUMOR]',
          error
        );
      }
    }
  );
}
