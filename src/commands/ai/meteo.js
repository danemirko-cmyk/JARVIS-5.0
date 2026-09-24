const WEATHER_API =
  'https://wttr.in';

function formatTemperature(value) {
  if (value === undefined || value === null) {
    return 'N/D';
  }

  return `${value}°C`;
}

export function registerMeteoCommand(registerCommand) {
  registerCommand(
    'meteo',
    async ({
      sock,
      chat,
      argumentText,
      args
    }) => {

      let city =
        String(argumentText || '').trim();

      if (!city && Array.isArray(args)) {
        city =
          args
            .map(value => String(value))
            .join(' ')
            .trim();
      }

      if (!city) {
        city = 'Pisa';
      }

      try {

        await sock.sendMessage(
          chat,
          {
            text:
              `🌤️ Cerco il meteo di *${city}*...`
          }
        );

        const url =
          `${WEATHER_API}/${encodeURIComponent(city)}?format=j1`;

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

        const data =
          await response.json();

        const current =
          data?.current_condition?.[0];

        const nearestArea =
          data?.nearest_area?.[0];

        if (!current) {
          throw new Error(
            'Dati meteo non disponibili.'
          );
        }

        const resolvedCity =
          nearestArea
            ?.areaName?.[0]?.value ||
          city;

        const country =
          nearestArea
            ?.country?.[0]?.value ||
          '';

        const description =
          current
            ?.lang_it?.[0]?.value ||
          current
            ?.weatherDesc?.[0]?.value ||
          'N/D';

        const temperature =
          formatTemperature(
            current.temp_C
          );

        const feelsLike =
          formatTemperature(
            current.FeelsLikeC
          );

        const humidity =
          current.humidity !== undefined
            ? `${current.humidity}%`
            : 'N/D';

        const wind =
          current.windspeedKmph !== undefined
            ? `${current.windspeedKmph} km/h`
            : 'N/D';

        const visibility =
          current.visibility !== undefined
            ? `${current.visibility} km`
            : 'N/D';

        const pressure =
          current.pressure !== undefined
            ? `${current.pressure} hPa`
            : 'N/D';

        const uv =
          current.uvIndex !== undefined
            ? current.uvIndex
            : 'N/D';

        const location =
          country
            ? `${resolvedCity}, ${country}`
            : resolvedCity;

        const text =
`🌤️ *METEO — ${location}*

🌡️ Temperatura: *${temperature}*
🥶 Percepita: *${feelsLike}*

☁️ Condizioni: *${description}*

💧 Umidità: *${humidity}*
💨 Vento: *${wind}*
👁️ Visibilità: *${visibility}*
🧭 Pressione: *${pressure}*
☀️ Indice UV: *${uv}*

🤖 *J.A.R.V.I.S 5.0*`;

        await sock.sendMessage(
          chat,
          {
            text
          }
        );

      } catch (error) {

        console.error(
          '[METEO] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              `❌ Non riesco a recuperare il meteo di *${city}*.\n\n` +
              'Controlla il nome della città e riprova.'
          }
        );
      }
    }
  );
}

