import {
  getGroupSettings,
  toggleGroupFunction
} from '../../services/groupFunctions.js';

import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

const FUNCTIONS = [

  {
    command: 'benvenuto',
    setting: 'welcome',
    label: '👋 Benvenuto'
  },

  {
    command: 'addio',
    setting: 'goodbye',
    label: '👋 Addio'
  },

  {
    command: 'antilink',
    setting: 'antilink',
    label: '🔗 Antilink'
  },

  {
    command: 'antilinkinstagram',
    setting: 'antilink_ig',
    label: '📸 Antilink Instagram'
  },

  {
    command: 'antilinktiktok',
    setting: 'antilink_tiktok',
    label: '🎵 Antilink TikTok'
  },

  {
    command: 'antiflood',
    setting: 'antiflood',
    label: '🌊 Antiflood'
  },

  {
    command: 'soloadmin',
    setting: 'soloadmin',
    label: '🔒 Solo Admin'
  },

  {
    command: 'bestemmiometro',
    setting: 'bestemmiometro',
    label: '🤬 Bestemmiometro'
  },

  {
    command: 'control',
    setting: 'control',
    label: '🛡️ Control'
  }

];

function status(value) {

  return Number(value) === 1
    ? '🟢 ON'
    : '🔴 OFF';
}

export function registerFunzioniCommand(
  registerCommand
) {

  // ==========================================================
  // .FUNZIONI
  // ==========================================================

  registerCommand(
    'funzioni',

    async ({
      sock,
      chat
    }) => {

      if (
        !chat.endsWith('@g.us')
      ) {

        await sock.sendMessage(
          chat,
          {
            text:
              '⚠️ Questo comando è disponibile solo nei gruppi.'
          }
        );

        return;
      }

      const settings =
        getGroupSettings(
          chat
        );

      if (!settings) {

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Impossibile recuperare le impostazioni del gruppo.'
          }
        );

        return;
      }

      const lines =
        FUNCTIONS.map(
          item =>
            `${item.label}\n${status(settings[item.setting])}`
        );

      const text =
`⚙️ *J.A.R.V.I.S 5.0*

⚙️ *FUNZIONI GRUPPO*

══════ •⊰✧⊱• ══════

${lines.join('\n\n')}

══════ •⊰✧⊱• ══════

💡 Usa il comando della funzione
per attivarla o disattivarla.

— *J.A.R.V.I.S 5.0* —`;

      await sendChannelButtonMessage({
        sock,
        chat,
        text
      });
    },

    {
      permission: 'ADMIN'
    }
  );

  // ==========================================================
  // COMANDI DELLE FUNZIONI
  // ==========================================================

  for (
    const item of FUNCTIONS
  ) {

    registerCommand(
      item.command,

      async ({
        sock,
        chat
      }) => {

        if (
          !chat.endsWith('@g.us')
        ) {

          await sock.sendMessage(
            chat,
            {
              text:
                '⚠️ Questa funzione è disponibile solo nei gruppi.'
            }
          );

          return;
        }

        const enabled =
          toggleGroupFunction(
            chat,
            item.setting
          );

        if (
          enabled === null
        ) {

          await sock.sendMessage(
            chat,
            {
              text:
                `❌ Errore durante la modifica di ${item.label}.`
            }
          );

          return;
        }

        await sock.sendMessage(
          chat,
          {
            text:
              `${item.label}\n\n` +
              `Stato: ${enabled ? '🟢 ON' : '🔴 OFF'}`
          }
        );
      },

      {
        permission: 'ADMIN'
      }
    );
  }
}
