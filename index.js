import { config } from './src/utils/config.js';
import { startWhatsApp } from './src/services/whatsapp.js';

import {
  registerMessageHandler
} from './src/handlers/messages.js';

import {
  executeCommand,
  registerCommand
} from './src/handlers/commands.js';

// ================================
// GRUPPO
// ================================

import {
  registerGruppoCommand
} from './src/commands/group/gruppo.js';

import {
  registerFunzioniCommand
} from './src/commands/group/funzioni.js';

// ================================
// AI
// ================================

import {
  registerChatCommand
} from './src/commands/ai/chat.js';

import {
  registerMeteoCommand
} from './src/commands/ai/meteo.js';

import {
  registerNewsCommand
} from './src/commands/ai/news.js';

import {
  registerPlayCommand
} from './src/commands/ai/play.js';

import {
  registerTestoCommand
} from './src/commands/ai/testo.js';

import {
  registerTTSCommand
} from './src/commands/ai/tts.js';

import {
  registerBlurCommand
} from './src/commands/ai/blur.js';

import {
  registerBonkCommand
} from './src/commands/ai/bonk.js';

import {
  registerSpidermanCommand
} from './src/commands/ai/spiderman.js';

// ================================
// PROFILO
// ================================

import {
  registerInfoCommand
} from './src/commands/profile/info.js';

import {
  registerSetIGCommand
} from './src/commands/profile/setig.js';

import {
  registerClassificaCommand
} from './src/commands/profile/classifica.js';

import {
  registerClassificaBestemmieCommand
} from './src/commands/profile/classificabestemmie.js';

// ================================
// ECONOMIA
// ================================

import {
  registerSaldoCommand
} from './src/commands/economy/saldo.js';

import {
  registerGiornalieroCommand
} from './src/commands/economy/giornaliero.js';

import {
  registerLavoroCommand
} from './src/commands/economy/lavoro.js';

import {
  registerRubaCommand
} from './src/commands/economy/ruba.js';

import {
  registerPagaCommand
} from './src/commands/economy/paga.js';

// ================================
// FUN
// ================================

import {
  register8BallCommand
} from './src/commands/fun/8ball.js';

import {
  registerAbbracciaCommand
} from './src/commands/fun/abbraccia.js';

import {
  registerBacioCommand
} from './src/commands/fun/bacio.js';

import {
  registerBlackhumorCommand
} from './src/commands/fun/blackhumor.js';

import {
  registerBombaCommand
} from './src/commands/fun/bomba.js';

import {
  registerCharacterCommand
} from './src/commands/fun/character.js';

import {
  registerDadoCommand
} from './src/commands/fun/dado.js';

import {
  registerDetectiveCommand
} from './src/commands/fun/detective.js';

import {
  registerDivertimentoCommands
} from './src/commands/fun/divertimento.js';

import {
  registerGrattaCommand
} from './src/commands/fun/gratta.js';

import {
  registerDuelloCommand
} from './src/commands/fun/duello.js';

import {
  registerGiornataCommand
} from './src/commands/fun/giornata.js';

import {
  registerImpiccatoCommand
} from './src/commands/fun/impiccato.js';

import {
  registerIndovinaNumeroCommand
} from './src/commands/fun/indovinaNumero.js';

import {
  registerIndovinelloCommand
} from './src/commands/fun/indovinello.js';

import {
  registerInsultaCommand
} from './src/commands/fun/insulta.js';

import {
  registerMatematicaCommand
} from './src/commands/fun/matematica.js';

import {
  registerMonetaCommand
} from './src/commands/fun/moneta.js';

import {
  registerQuizCommand
} from './src/commands/fun/quiz.js';

import {
  registerSCommand
} from './src/commands/fun/s.js';

import {
  registerSassoCommand
} from './src/commands/fun/sasso.js';

import {
  registerSlotCommand
} from './src/commands/fun/slot.js';

import {
  registerTrisCommand
} from './src/commands/fun/tris.js';

import {
  registerTriviaCommand
} from './src/commands/fun/trivia.js';

import {
  registerTwinCommand
} from './src/commands/fun/twin.js';

import {
  registerWordleCommand
} from './src/commands/fun/wordle.js';

import {
  registerZizzaniaCommand
} from './src/commands/fun/zizzania.js';

// ================================
// MEDIA
// ================================

import {
  registerImmagineCommand
} from './src/commands/media/immagine.js';

import {
  registerRivelaCommand
} from './src/commands/media/rivela.js';

// ================================
// UTILITY
// ================================

import {
  registerInfobotCommand
} from './src/commands/utility/infobot.js';

import {
  registerMenuCommand
} from './src/commands/utility/menu.js';

import {
  registerUpCommand
} from './src/commands/utility/up.js';

// ================================
// ADMIN
// ================================

import {
  registerAdminCommand
} from './src/commands/admin/admin.js';

import {
  registerAdminsCommand
} from './src/commands/admin/admins.js';

import {
  registerApertoCommand
} from './src/commands/admin/aperto.js';

import {
  registerChiusoCommand
} from './src/commands/admin/chiuso.js';

import {
  registerDegradaCommand
} from './src/commands/admin/degrada.js';

import {
  registerEliminaCommand
} from './src/commands/admin/elimina.js';

import {
  registerHidetagCommand
} from './src/commands/admin/hidetag.js';

import {
  registerKickCommand
} from './src/commands/admin/kick.js';

import {
  registerLinkCommand
} from './src/commands/admin/link.js';

import {
  registerMutaCommand
} from './src/commands/admin/muta.js';

import {
  registerPromuoviCommand
} from './src/commands/admin/promuovi.js';

import {
  registerSmutaCommand
} from './src/commands/admin/smuta.js';

import {
  registerWarnCommand
} from './src/commands/admin/warn.js';

import {
  registerUnwarnCommand
} from './src/commands/admin/unwarn.js';

import {
  registerBlockCommand
} from './src/commands/admin/block.js';

import {
  registerUnblockCommand
} from './src/commands/admin/unblock.js';

import {
  registerBlocklistCommand
} from './src/commands/admin/blocklist.js';

// ================================
// OWNER
// ================================

import {
  registerOwnerCommand
} from './src/commands/owner/owner.js';

import {
  registerProprietarioCommand
} from './src/commands/owner/proprietario.js';

import {
  registerAddOwnerCommand
} from './src/commands/owner/addowner.js';

import {
  registerDelOwnerCommand
} from './src/commands/owner/delowner.js';

import {
  registerRestartCommand
} from './src/commands/owner/restart.js';

import {
  registerShutdownCommand
} from './src/commands/owner/shutdown.js';

import {
  registerBackupCommand
} from './src/commands/owner/backup.js';

import {
  registerGodmodeCommand
} from './src/commands/owner/godmode.js';

import {
  registerGodCommand
} from './src/commands/owner/god.js';

import {
  registerStatsCommand
} from './src/commands/owner/stats.js';

import {
  registerSsCommand
} from './src/commands/owner/ss.js';

import {
  registerBotCommand
} from './src/commands/owner/bot.js';

import {
  registerListCommand
} from './src/commands/owner/list.js';

// ================================
// AVVIO
// ================================

async function main() {
  console.log('====================================');
  console.log('          JARVIS 5.0');
  console.log('====================================');
  console.log('🚀 Avvio JARVIS...');

  // ================================
  // REGISTRAZIONE COMANDI
  // ================================

  // GRUPPO
  registerGruppoCommand(registerCommand);
  registerFunzioniCommand(registerCommand);

  // AI
  registerChatCommand(registerCommand);
  registerMeteoCommand(registerCommand);
  registerNewsCommand(registerCommand);
  registerPlayCommand(registerCommand);
  registerTestoCommand(registerCommand);
  registerTTSCommand(registerCommand);
  registerBlurCommand(registerCommand);
  registerBonkCommand(registerCommand);
  registerSpidermanCommand(registerCommand);

  // PROFILO
  registerInfoCommand(registerCommand);
  registerSetIGCommand(registerCommand);
  registerClassificaCommand(registerCommand);
  registerClassificaBestemmieCommand(registerCommand);

  // ECONOMIA
  registerSaldoCommand(registerCommand);
  registerGiornalieroCommand(registerCommand);
  registerLavoroCommand(registerCommand);
  registerRubaCommand(registerCommand);
  registerPagaCommand(registerCommand);

  // FUN
  register8BallCommand(registerCommand);
  registerAbbracciaCommand(registerCommand);
  registerBacioCommand(registerCommand);
  registerBlackhumorCommand(registerCommand);
  registerBombaCommand(registerCommand);
  registerCharacterCommand(registerCommand);
  registerDadoCommand(registerCommand);
  registerDetectiveCommand(registerCommand);
  registerDivertimentoCommands(registerCommand);
  registerGrattaCommand(registerCommand);
  registerDuelloCommand(registerCommand);
  registerGiornataCommand(registerCommand);
  registerImpiccatoCommand(registerCommand);
  registerIndovinaNumeroCommand(registerCommand);
  registerIndovinelloCommand(registerCommand);
  registerInsultaCommand(registerCommand);
  registerMatematicaCommand(registerCommand);
  registerMonetaCommand(registerCommand);
  registerQuizCommand(registerCommand);
  registerSCommand(registerCommand);
  registerSassoCommand(registerCommand);
  registerSlotCommand(registerCommand);
  registerTrisCommand(registerCommand);
  registerTriviaCommand(registerCommand);
  registerTwinCommand(registerCommand);
  registerWordleCommand(registerCommand);
  registerZizzaniaCommand(registerCommand);

  // MEDIA
  registerImmagineCommand(registerCommand);
  registerRivelaCommand(registerCommand);

  // UTILITY
  registerInfobotCommand(registerCommand);
  registerMenuCommand(registerCommand);
  registerUpCommand(registerCommand);

  // ADMIN
  registerAdminCommand(registerCommand);
  registerAdminsCommand(registerCommand);
  registerApertoCommand(registerCommand);
  registerChiusoCommand(registerCommand);
  registerDegradaCommand(registerCommand);
  registerEliminaCommand(registerCommand);
  registerHidetagCommand(registerCommand);
  registerKickCommand(registerCommand);
  registerLinkCommand(registerCommand);
  registerMutaCommand(registerCommand);
  registerPromuoviCommand(registerCommand);
  registerSmutaCommand(registerCommand);
  registerWarnCommand(registerCommand);
  registerUnwarnCommand(registerCommand);

  // BLOCK SYSTEM
  registerBlockCommand(registerCommand);
  registerUnblockCommand(registerCommand);
  registerBlocklistCommand(registerCommand);

  // OWNER
  registerOwnerCommand(registerCommand);
  registerProprietarioCommand(registerCommand);
  registerAddOwnerCommand(registerCommand);
  registerDelOwnerCommand(registerCommand);
  registerRestartCommand(registerCommand);
  registerShutdownCommand(registerCommand);
  registerBackupCommand(registerCommand);
  registerGodmodeCommand(registerCommand);
  registerGodCommand(registerCommand);
  registerStatsCommand(registerCommand);
  registerSsCommand(registerCommand);
  registerBotCommand(registerCommand);
  registerListCommand(registerCommand);

  console.log('✅ Comandi registrati.');

  // ================================
  // WHATSAPP
  // ================================

  const sock = await startWhatsApp();

  // ================================
  // HANDLER MESSAGGI
  // ================================

  registerMessageHandler(sock, {
    onCommand: executeCommand
  });

  console.log('✅ Handler messaggi registrato.');
  console.log('🤖 JARVIS 5.0 ONLINE');
  console.log('====================================');

  return sock;
}

main().catch(error => {
  console.error(
    '❌ Errore fatale durante l\'avvio di JARVIS:',
    error
  );

  process.exit(1);
});
