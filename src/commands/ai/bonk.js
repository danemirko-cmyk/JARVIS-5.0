import sharp from 'sharp';

function cleanJid(jid) {
  return String(jid || '')
    .split(':')[0]
    .split('@')[0];
}

function getMentionedUser(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  const mentioned =
    context?.mentionedJid || [];

  return mentioned[0] || null;
}

function createBonkOverlay() {
  return `
    <svg
      width="1080"
      height="1080"
      viewBox="0 0 1080 1080"
      xmlns="http://www.w3.org/2000/svg"
    >

      <defs>
        <filter
          id="shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="8"
            dy="12"
            stdDeviation="8"
            flood-opacity="0.45"
          />
        </filter>
      </defs>

      <!-- martello cartoon -->
      <g
        transform="rotate(-28 820 250)"
        filter="url(#shadow)"
      >

        <!-- manico -->
        <rect
          x="785"
          y="300"
          width="58"
          height="430"
          rx="25"
          fill="#8B5A2B"
          stroke="#3d2412"
          stroke-width="12"
        />

        <!-- testa -->
        <rect
          x="650"
          y="180"
          width="330"
          height="180"
          rx="45"
          fill="#777"
          stroke="#292929"
          stroke-width="14"
        />

        <rect
          x="625"
          y="205"
          width="65"
          height="130"
          rx="25"
          fill="#999"
          stroke="#292929"
          stroke-width="12"
        />

        <rect
          x="940"
          y="205"
          width="65"
          height="130"
          rx="25"
          fill="#999"
          stroke="#292929"
          stroke-width="12"
        />

      </g>

      <!-- stelle cartoon -->
      <g
        fill="#FFD93D"
        stroke="#7A5B00"
        stroke-width="8"
      >
        <path d="M180 180 l18 45 48 4-37 31 11 47-40-25-40 25 11-47-37-31 48-4z"/>
        <path d="M880 650 l15 36 39 3-30 25 9 38-33-20-33 20 9-38-30-25 39-3z"/>
        <path d="M190 760 l12 30 33 3-25 21 7 32-27-17-28 17 8-32-26-21 34-3z"/>
      </g>

      <!-- BONK -->
      <text
        x="540"
        y="920"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif"
        font-size="190"
        font-weight="900"
        fill="#FFDE00"
        stroke="#111"
        stroke-width="22"
        paint-order="stroke"
      >
        BONK!
      </text>

    </svg>
  `;
}

export function registerBonkCommand(registerCommand) {
  registerCommand(
    'bonk',
    async ({
      sock,
      chat,
      message
    }) => {

      const target =
        getMentionedUser(message);

      if (!target) {
        await sock.sendMessage(
          chat,
          {
            text:
              '🔨 *BONK!*\n\n' +
              'Devi taggare una persona.\n\n' +
              'Esempio:\n' +
              '`.bonk @utente`'
          }
        );

        return;
      }

      const targetPhone =
        cleanJid(target);

      try {
        let imageUrl = null;

        try {
          imageUrl =
            await sock.profilePictureUrl(
              target,
              'image'
            );
        } catch {
          imageUrl = null;
        }

        if (!imageUrl) {
          await sock.sendMessage(
            chat,
            {
              text:
                `🔨 Non riesco a recuperare la foto profilo di @${targetPhone}.`,
              mentions: [target]
            }
          );

          return;
        }

        const response =
          await fetch(imageUrl);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const originalBuffer =
          Buffer.from(
            await response.arrayBuffer()
          );

        if (!originalBuffer.length) {
          throw new Error(
            'Foto profilo vuota.'
          );
        }

        const overlay =
          Buffer.from(
            createBonkOverlay()
          );

        const finalImage =
          await sharp(originalBuffer)
            .resize(
              1080,
              1080,
              {
                fit: 'cover',
                position: 'centre'
              }
            )
            .composite([
              {
                input: overlay,
                blend: 'over'
              }
            ])
            .jpeg({
              quality: 92
            })
            .toBuffer();

        await sock.sendMessage(
          chat,
          {
            image: finalImage,

            caption:
              `🔨 *BONK!*\n\n` +
              `@${targetPhone} ha ricevuto un BONK! 😂`,

            mentions: [target]
          }
        );

      } catch (error) {
        console.error(
          '[BONK] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non sono riuscito a creare l\'effetto BONK.'
          }
        );
      }
    }
  );
}
