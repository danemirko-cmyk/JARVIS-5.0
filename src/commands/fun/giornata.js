const PREVISIONI = [
  'oggi incontrerai una persona misteriosa che probabilmente vuole solo una merendina.',
  'oggi avrai una fortuna assurda, ma solo dalle 14:37 alle 14:41.',
  'oggi qualcuno parlerà di te mentre sei nella stessa stanza.',
  'oggi perderai qualcosa che avevi in mano 4 secondi prima.',
  'oggi riceverai un messaggio completamente inutile ma importantissimo.',
  'oggi il tuo destino dipende da una patatina.',
  'oggi incontrerai un piccione che saprà più cose di te.',
  'oggi avrai una discussione molto seria con il tuo frigorifero.',
  'oggi una decisione casuale cambierà completamente il tuo pomeriggio.',
  'oggi JARVIS consiglia di non fidarti dei cucchiai.',
  'oggi avrai una quantità sospetta di fortuna.',
  'oggi qualcuno ti offrirà qualcosa e tu accetterai senza sapere perché.',
  'oggi il tuo livello di caos sarà superiore alla media nazionale.'
];

const CONSIGLI = [
  'Porta fortuna: una bottiglia d’acqua.',
  'Evita: persone che iniziano le frasi con “fidati”.',
  'Colore fortunato: quello che hai addosso.',
  'Numero fortunato: 37.',
  'Oggetto fortunato: un cucchiaio.',
  'Nemico della giornata: il caricabatterie.',
  'Missione: arrivare a sera senza combinare disastri.'
];

export function registerGiornataCommand(registerCommand) {
  registerCommand(
    'giornata',
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
                '🔮 Usa `.giornata @utente`!'
            },
            { quoted: message }
          );
          return;
        }

        const previsione =
          PREVISIONI[
            Math.floor(
              Math.random() *
              PREVISIONI.length
            )
          ];

        const consiglio =
          CONSIGLI[
            Math.floor(
              Math.random() *
              CONSIGLI.length
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
`🔮 *GIORNATA JARVIS*

👤 @${number}

🌤️ *Previsione:*
${previsione}

🍀 *Consiglio cosmico:*
${consiglio}

⚠️ Attendibilità scientifica:
*0,00001%*

🤖 JARVIS 5.0`,
            mentions: [target]
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[GIORNATA]',
          error
        );
      }
    }
  );
}
