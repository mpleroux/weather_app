export const useWeatherData = (
  city: Ref<string>,
  lat: Ref<number | null>,
  lon: Ref<number | null>,
  tempApiUnit: Ref<string>,
  windApiUnit: Ref<string>,
  precipApiUnit: Ref<string>,
) => {
  // Shape of the Open-Meteo forecast API response
  interface WeatherResponse {
    current: {
      time: string;
      temperature_2m: number;
      apparent_temperature: number;
      weather_code: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
      relative_humidity_2m: number;
      precipitation: number;
      is_day: number;
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      wind_speed_10m_max: number[];
    };
    hourly: {
      time: string[];
      temperature_2m: number[];
      weather_code: number[];
      precipitation_probability: number[];
      is_day: number[];
    };
  }

  // Fetch weather data — if coordinates are missing from the URL, geocode the
  // city name and redirect to the same URL with coordinates added
  const { data, pending, error, refresh } = useAsyncData(
    () =>
      `weather-${city.value}-${lat.value ?? "geo"}-${lon.value ?? "geo"}-${tempApiUnit.value}-${windApiUnit.value}-${precipApiUnit.value}`,
    async () => {
      let resolvedLat: number;
      let resolvedLon: number;

      if (lat.value !== null && lon.value !== null) {
        resolvedLat = lat.value;
        resolvedLon = lon.value;
      } else {
        const geoResponse = await $fetch<{
          results?: Array<{ latitude: number; longitude: number }>;
        }>(
          `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(city.value)}&count=1&language=en&format=json`,
        );
        const loc = geoResponse.results?.[0];
        if (!loc) throw new Error(`City not found: ${city.value}`);
        await navigateTo(
          `/weather/${encodeURIComponent(city.value)}` +
            `?lat=${loc.latitude}&lon=${loc.longitude}`,
        );
        return null;
      }

      return await $fetch<WeatherResponse>(
        `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${resolvedLat}&longitude=${resolvedLon}` +
          `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation,is_day` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
          `&hourly=temperature_2m,weather_code,precipitation_probability,is_day` +
          `&temperature_unit=${tempApiUnit.value}&wind_speed_unit=${windApiUnit.value}&precipitation_unit=${precipApiUnit.value}` +
          `&timezone=auto&forecast_days=7`,
      );
    },
    { watch: [city, lat, lon, tempApiUnit, windApiUnit, precipApiUnit] },
  );

  // Unwrap the raw AsyncData value for use in the template
  const weatherData = computed(() => data.value ?? null);

  return { weatherData, pending, error, refresh };
};
