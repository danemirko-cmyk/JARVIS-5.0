function cleanLocation(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function formatTemperature(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return 'N/D';
  }

  return `${value}°C`;
}

function weatherEmoji(code) {
  const value = Number(code);

  if (value === 113) return '☀️';
  if (value === 116) return '🌤️';
  if (value === 119 || value === 122) return '☁️';
  if (value >= 176 && value <= 263) return '🌧️';
  if (value >= 266 && value <= 395) return '🌧️';
  if (value >= 395) return '❄️';

  return '🌤️';
}

function getArgumentText(context) {
  if (
    Array.isArray(context.args) &&
    context.args.length > 0
  ) {
    return context.args.join(' ').trim();
  }

  if (
    typeof context.argumentText === 'string'
  ) {
    return context.argumentText.trim();
  }

  return '';
}

export function registerMeteoCommand(
  registerCommand
) {
  registerCommand(
    'meteo',

    async ({
      sock,
      chat,
      message,
      ...context
    }) => {

      const location =
        cleanLocation(
          getArgumentText(context)
        );

      if (!location) {
        await sock.sendMessage(
          chat,
          {
            text:
`🌤️ *METEO J.A.R.V.I.S 5.0*

Indica una città.

Esempio:

*.meteo Pisa*

oppure:

*.meteo Roma*`
          },
          {
            quoted: message
          }
        );

        return;
      }

      try {
        const url =
          `https://wttr.in/${encodeURIComponent(location)}?format=j1`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        const current =
          data?.current_condition?.[0];

        const area =
          data?.nearest_area?.[0];

        if (!current) {
          throw new Error(
            'Dati meteo non disponibili.'
          );
        }

        const city =
          area?.areaName?.[0]?.value ||
          location;

        const country =
          area?.country?.[0]?.value ||
          '';

        const description =
          current
            ?.weatherDesc?.[0]
            ?.value ||
          'Condizioni non disponibili';

        const emoji =
          weatherEmoji(
            current.weatherCode
          );

        const temperature =
          formatTemperature(
            current.temp_C
          );

        const feelsLike =
          formatTemperature(
            current.FeelsLikeC
          );

        const humidity =
          current.humidity ??
          'N/D';

        const wind =
          current.windspeedKmph ??
          'N/D';

        const visibility =
          current.visibility ??
          'N/D';

        await sock.sendMessage(
          chat,
          {
            text:
`🌤️ *METEO J.A.R.V.I.S 5.0*

══════ •⊰✧⊱• ══════

📍 *${city}${country ? `, ${country}` : ''}*

${emoji} ${description}

🌡️ Temperatura:
*${temperature}*

🤚 Percepita:
*${feelsLike}*

💧 Umidità:
*${humidity}%*

💨 Vento:
*${wind} km/h*

👁️ Visibilità:
*${visibility} km*

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`
          },
          {
            quoted: message
          }
        );

      } catch (error) {

        console.error(
          '[METEO] Errore:',
          error.message
        );

        await sock.sendMessage(
          chat,
          {
            text:
`❌ *METEO*

Non riesco a recuperare il meteo per:

📍 *${location}*

Controlla il nome della città e riprova.`
          },
          {
            quoted: message
          }
        );
      }
    },

    {
      permission: 'USER'
    }
  );
}
