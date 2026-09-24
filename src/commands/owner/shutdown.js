export function registerShutdownCommand(registerCommand) {
  registerCommand(
    'shutdown',
    async ({ sock, chat }) => {

      await sock.sendMessage(chat, {
        text:
          '🛑 *J.A.R.V.I.S 5.0*\n\n' +
          'Arresto del bot in corso...'
      });

      setTimeout(() => {
        process.exit(0);
      }, 1000);
    },
    {
      permission: 'OWNER'
    }
  );
}
