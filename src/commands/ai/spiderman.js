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

  if (mentioned.length > 0) {
    return mentioned[0];
  }

  return null;
}

function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}

function createSpiderWebSvg(width, height) {
  const cx = width / 2;
  const cy = height / 2;

  const maxRadius =
    Math.sqrt(
      (width / 2) ** 2 +
      (height / 2) ** 2
    );

  let radialLines = '';

  const lines = 16;

  for (let i = 0; i < lines; i++) {
    const angle =
      (Math.PI * 2 * i) / lines;

    const x =
      cx +
      Math.cos(angle) * maxRadius;

    const y =
      cy +
      Math.sin(angle) * maxRadius;

    radialLines += `
      <line
        x1="${cx}"
        y1="${cy}"
        x2="${x}"
        y2="${y}"
        stroke="white"
        stroke-width="${Math.max(3, width / 500)}"
        opacity="0.72"
      />
    `;
  }

  let rings = '';

  const ringCount = 9;

  for (let r = 1; r <= ringCount; r++) {
    const radius =
      (maxRadius / ringCount) * r;

    rings += `
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${radius}"
        fill="none"
        stroke="white"
        stroke-width="${Math.max(2, width / 700)}"
        opacity="0.62"
      />
    `;
  }

  return `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >

      <defs>

        <filter
          id="glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >

          <feGaussianBlur
            stdDeviation="${Math.max(2, width / 250)}"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>

        </filter>

      </defs>

      <g filter="url(#glow)">

        ${radialLines}

        ${rings}

        <circle
          cx="${cx}"
          cy="${cy}"
          r="${Math.max(8, width / 80)}"
          fill="white"
          opacity="0.85"
        />

      </g>

    </svg>
  `;
}

function createAnimationFrame(step, targetPhone) {
  const frames = [
    `🕷️ *SPIDER-MAN!*\n\n@${targetPhone}... preparati!`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ─────────────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ─────────────────────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ─────────────────────────────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ─────────────────────────────────────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ─────────────────────────────────────────────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️ ───────────────────────────────────────────────────────➤`,
    `🕷️ *SPIDER-MAN!*\n\n🕸️💥 *PRESO!*`
  ];

  return frames[Math.min(step, frames.length - 1)];
}

export function registerSpidermanCommand(registerCommand) {

  registerCommand(
    'spiderman',

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
              '🕷️ *SPIDER-MAN*\n\n' +
              'Devi taggare una persona.\n\n' +
              'Esempio:\n' +
              '`.spiderman @utente`'
          }
        );

        return;
      }

      const targetPhone =
        cleanJid(target);

      /*
       * -----------------------------------------------------
       * MESSAGGIO ANIMATO
       * -----------------------------------------------------
       */

      let animationMessage;

      try {

        animationMessage =
          await sock.sendMessage(
            chat,
            {
              text:
                createAnimationFrame(
                  0,
                  targetPhone
                ),
              mentions: [target]
            }
          );

        if (animationMessage?.key) {

          for (let i = 1; i <= 8; i++) {

            await sleep(300);

            await sock.sendMessage(
              chat,
              {
                text:
                  createAnimationFrame(
                    i,
                    targetPhone
                  ),
                edit: animationMessage.key
              }
            );
          }

          await sleep(500);

        }

      } catch (error) {

        console.error(
          '[SPIDERMAN] Errore animazione:',
          error
        );

      }

      try {

        /*
         * ---------------------------------------------------
         * FOTO PROFILO
         * ---------------------------------------------------
         */

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
                `🕷️ Non riesco a recuperare la foto profilo di @${targetPhone}.`,
              mentions: [target]
            }
          );

          return;
        }

        /*
         * ---------------------------------------------------
         * DOWNLOAD FOTO
         * ---------------------------------------------------
         */

        const response =
          await fetch(imageUrl);

        if (!response.ok) {

          throw new Error(
            `Impossibile scaricare la foto profilo: HTTP ${response.status}`
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

        /*
         * ---------------------------------------------------
         * CREAZIONE EFFETTO RAGNATELA
         * ---------------------------------------------------
         */

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
                input:
                  Buffer.from(
                    createSpiderWebSvg(
                      1080,
                      1080
                    )
                  ),
                blend: 'screen'
              }
            ])
            .jpeg({
              quality: 92
            })
            .toBuffer();

        /*
         * ---------------------------------------------------
         * INVIO FOTO FINALE
         * ---------------------------------------------------
         */

        await sock.sendMessage(
          chat,
          {
            image: finalImage,

            caption:
              `🕷️ *SPIDER-MAN*\n\n` +
              `🕸️ @${targetPhone} è stato catturato!`,

            mentions: [target]
          }
        );

      } catch (error) {

        console.error(
          '[SPIDERMAN] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non sono riuscito a completare l\'effetto Spider-Man.'
          }
        );
      }
    }
  );
}
