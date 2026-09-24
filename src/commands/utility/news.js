function cleanTopic(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function decodeXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value) {
  return decodeXml(value)
    .replace(/<[^>]*>/g, '')
    .trim();
}

function extractItems(xml) {
  const items = [];
  const matches =
    xml.match(
      /<item\b[\s\S]*?<\/item>/gi
    ) || [];

  for (const item of matches.slice(0, 5)) {

    const title =
      item.match(
        /<title>([\s\S]*?)<\/title>/i
      )?.[1];

    const link =
      item.match(
        /<link>([\s\S]*?)<\/link>/i
      )?.[1];

    if (!title || !link) {
      continue;
    }

    items.push({
      title:
        stripHtml(title),

      link:
        decodeXml(link)
    });
  }

  return items;
}

export function registerNewsCommand(
  registerCommand
) {
  registerCommand(
    'news',
    async ({
      sock,
      chat,
      argumentText,
      message
    }) => {

      const topic =
        cleanTopic(
          argumentText
        );

      const query =
        topic ||
        'Italia';

      try {

        const url =
          `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=it&gl=IT&ceid=IT:it`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const xml =
          await response.text();

        const items =
          extractItems(xml);

        if (!items.length) {
          await sock.sendMessage(
            chat,
            {
              text:
`📰 *NEWS*

Non ho trovato notizie per:

🔎 *${query}*`
            },
            {
              quoted: message
            }
          );

          return;
        }

        let text =
`📰 *J.A.R.V.I.S 5.0 — NEWS*

🔎 Ricerca: *${query}*

══════ •⊰✧⊱• ══════

`;

        items.forEach(
          (item, index) => {
            text +=
`${index + 1}. 📰 *${item.title}*
🔗 ${item.link}

`;
          }
        );

        text +=
`══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

        await sock.sendMessage(
          chat,
          {
            text
          },
          {
            quoted: message
          }
        );

      } catch (error) {

        console.error(
          '[NEWS] Errore:',
          error.message
        );

        await sock.sendMessage(
          chat,
          {
            text:
`❌ *NEWS*

Non riesco a recuperare le notizie in questo momento.

Riprova tra poco.`
          },
          {
            quoted: message
          }
        );
      }
    }
  );
}
