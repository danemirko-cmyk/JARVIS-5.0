const GOOGLE_NEWS_URL =
  'https://news.google.com/rss/search';

function escapeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractItems(xml) {
  const items = [];
  const itemRegex =
    /<item>([\s\S]*?)<\/item>/gi;

  let match;

  while (
    (match = itemRegex.exec(xml)) !== null
  ) {
    const block = match[1];

    const title =
      block.match(
        /<title>([\s\S]*?)<\/title>/i
      )?.[1] || '';

    const link =
      block.match(
        /<link>([\s\S]*?)<\/link>/i
      )?.[1] || '';

    const pubDate =
      block.match(
        /<pubDate>([\s\S]*?)<\/pubDate>/i
      )?.[1] || '';

    const source =
      block.match(
        /<source[^>]*>([\s\S]*?)<\/source>/i
      )?.[1] || '';

    const cleanTitle =
      stripHtml(
        escapeXml(title)
      );

    if (!cleanTitle) continue;

    items.push({
      title: cleanTitle,
      link: stripHtml(link),
      pubDate: stripHtml(pubDate),
      source: stripHtml(
        escapeXml(source)
      )
    });

    if (items.length >= 5) {
      break;
    }
  }

  return items;
}

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date =
    new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString(
    'it-IT',
    {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
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
      args
    }) => {

      let topic =
        String(
          argumentText || ''
        ).trim();

      if (
        !topic &&
        Array.isArray(args)
      ) {
        topic =
          args
            .map(value => String(value))
            .join(' ')
            .trim();
      }

      if (!topic) {
        topic = 'Italia';
      }

      try {

        await sock.sendMessage(
          chat,
          {
            text:
              `📰 Cerco le ultime notizie su *${topic}*...`
          }
        );

        const url =
          `${GOOGLE_NEWS_URL}?q=` +
          `${encodeURIComponent(topic)}` +
          `&hl=it&gl=IT&ceid=IT:it`;

        const response =
          await fetch(
            url,
            {
              headers: {
                'User-Agent':
                  'JARVIS-5.0'
              }
            }
          );

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
                `📰 Non ho trovato notizie recenti su *${topic}*.`
            }
          );

          return;
        }

        let text =
          `📰 *ULTIME NOTIZIE — ${topic}*\n\n`;

        items.forEach(
          (item, index) => {

            text +=
              `*${index + 1}. ${item.title}*\n`;

            if (item.source) {
              text +=
                `🗞️ ${item.source}\n`;
            }

            const date =
              formatDate(
                item.pubDate
              );

            if (date) {
              text +=
                `🕐 ${date}\n`;
            }

            if (item.link) {
              text +=
                `🔗 ${item.link}\n`;
            }

            text += '\n';
          }
        );

        text +=
          `— *J.A.R.V.I.S 5.0* —`;

        await sock.sendMessage(
          chat,
          {
            text
          }
        );

      } catch (error) {

        console.error(
          '[NEWS] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non riesco a recuperare le notizie in questo momento.'
          }
        );
      }
    }
  );
}
