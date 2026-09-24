import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

export function registerGruppoCommand(registerCommand) {
  registerCommand(
    'gruppo',
    async ({ sock, chat }) => {

      const text =
`👥 *J.A.R.V.I.S 5.0*
📂 *COMANDI DISPONIBILI A TUTTI*

══════ •⊰✧⊱• ══════

🤖 *INTELLIGENZA ARTIFICIALE*

• 💬 .chat
• 🌤️ .meteo
• 📰 .news
• 🎵 .play
• 📝 .testo
• 🔊 .tts
• 🎬 .s
• 🔐 .rivela
• 🕷️ .spiderman
• 🔨 .bonk
• 🌫️ .blur

══════ •⊰✧⊱• ══════

👤 *PROFILO*

• 📊 .info
• 📸 .setig

══════ •⊰✧⊱• ══════

🎮 *GIOCHI*

• 🎲 .dado
• 🪙 .moneta
• 🔮 .8ball
• ✊ .sasso
• 🧩 .indovinello
• 🎯 .quiz
• 🎰 .slot
• 🧠 .trivia
• ➗ .matematica
• 💀 .impiccato
• ❌ .tris
• 💣 .bomba
• ⚔️ .duello
• 🟩 .wordle
• 🔢 .indovina numero

══════ •⊰✧⊱• ══════

😂 *DIVERTIMENTO*

• 🏳️‍🌈 .gay
• 🏳️‍🌈 .lesbica
• 🏳️‍⚧️ .trans
• 🍀 .fortunato
• 🤪 .scemo
• 🤡 .pagliaccio
• 🤖 .npc
• 💀 .sfiga
• 😎 .simpatico
• 💘 .ship
• ❤️ .crush
• 🔞 .sega
• 🧹 .scopa
• 👑 .diventaadmin

══════ •⊰✧⊱• ══════

🆕 *NUOVO DIVERTIMENTO*

• 👯 .twin
• 💋 .bacio
• 🤗 .abbraccia
• 🐍 .zizzania
• 🤬 .insulta
• 🕵️ .detective
• 🔮 .giornata
• 🖤 .blackhumor
• 🎭 .character

══════ •⊰✧⊱• ══════

💰 *ECONOMIA*

• 💳 .saldo
• 🎁 .giornaliero
• 💼 .lavoro
• 🥷 .ruba
• 💸 .paga

══════ •⊰✧⊱• ══════

🏆 *CLASSIFICHE*

• 🏆 .classifica
• 🤬 .classificabestemmie

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

      await sendChannelButtonMessage({
        sock,
        chat,
        text
      });
    }
  );
}
