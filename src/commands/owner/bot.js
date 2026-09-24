export function registerBotCommand(registerCommand) {
  registerCommand(
    'bot',
    async ({ sock, chat }) => {
      await sock.sendMessage(chat, {
        text:
          'non hai ulteriori bot aggiuntivi'
      });
    },
    {
      permission: 'OWNER'
    }
  );
}
