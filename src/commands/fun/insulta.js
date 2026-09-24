const INSULTI = [
  'sei riuscito a perdere anche contro il tutorial 💀',
  'hai il talento naturale per complicare le cose semplici 😂',
  'JARVIS ha analizzato la situazione e consiglia un aggiornamento del cervello 🤖',
  'sei talmente lento che il Wi-Fi ti aspetta 😭',
  'se la confusione fosse uno sport avresti già vinto 🏆',
  'hai un rapporto complicato con la logica 😂',
  'JARVIS sta ancora cercando di capire come fai certe cose 💀',
  'sei la dimostrazione che anche il caos può avere una personalità 🤡',
  'hai più bug di una versione beta 😂',
  'il tuo cervello oggi sembra essere in manutenzione 🔧',
  'JARVIS ha rilevato un livello preoccupante di scemenza 😂',
  'sei riuscito a rendere complicata anche questa frase 😭'
];

export function registerInsultaCommand(registerCommand) {
  registerCommand(
    'insulta',
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
                '🤬 Tagga qualcuno con `.insulta @utente`!'
            },
            { quoted: message }
          );
          return;
        }

        const insult =
          INSULTI[
            Math.floor(
              Math.random() *
              INSULTI.length
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
`🤬 *JARVIS INSULTA*

@${number}

${insult}

😂 *È SOLO PER SCHERZARE!*`,
            mentions: [target]
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[INSULTA]',
          error
        );
      }
    }
  );
}
