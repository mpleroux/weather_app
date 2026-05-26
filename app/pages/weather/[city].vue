<script setup lang="ts">
// Read route params, query strings, and unit preferences
const route = useRoute();
const { units, tempUnit, speedUnit } = useUnits();

// Use dark mode indicator to determine weather icon type
const isDark = useIsDark();
const iconFolder = computed(() => (isDark.value ? "fill" : "monochrome"));

// Parse the city slug and coordinates from the URL
const city = computed<string>(() => route.params.city as string);
const queryLat = computed<number | null>(() =>
  route.query.lat ? parseFloat(route.query.lat as string) : null,
);
const queryLon = computed<number | null>(() =>
  route.query.lon ? parseFloat(route.query.lon as string) : null,
);

// Reverse geocode coordinates to a human-readable location name (city, region, country)
interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country_code?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
}

const { data: locationData } = useAsyncData(
  () => `nominatim-${queryLat.value}-${queryLon.value}`,
  async () => {
    if (queryLat.value === null || queryLon.value === null) return null;
    return await $fetch<NominatimResponse>(
      `https://nominatim.openstreetmap.org/reverse` +
        `?lat=${queryLat.value}&lon=${queryLon.value}&format=json`,
    );
  },
  { watch: [queryLat, queryLon], server: false },
);

// Build the display name from the Nominatim response; fall back to the URL slug if not yet resolved
const displayName = computed<string>(() => {
  const addr = locationData.value?.address;
  if (!addr) return city.value;
  return [
    addr.city ?? addr.town ?? addr.village,
    addr.state,
    addr.country_code?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(", ");
});

// Save this city URL to localStorage so returning users are redirected here from /
onMounted(() => {
  localStorage.setItem("lastCityUrl", route.fullPath);
});

// Save the current city to the persistent cities list once the display name resolves
const { addCity } = useSavedCities();

// Pull in search state and navigation from the shared composable
const { searchQuery, searchResults, searching, showResults, navigateToCity } =
  useCitySearch();

watch(
  displayName,
  (name) => {
    if (name && queryLat.value !== null && queryLon.value !== null) {
      addCity({
        name: city.value,
        displayName: name,
        lat: queryLat.value,
        lon: queryLon.value,
      });
    }
  },
  { once: true },
);

// Geolocation state
const isLocating = ref<boolean>(false);

// Detect the user's location via the browser Geolocation API,
// then reverse geocode with Nominatim to get a city name for the URL
const detectLocation = (): void => {
  if (!navigator.geolocation) return;
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const result = await $fetch<{
          address: {
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            country?: string;
          };
        }>(
          `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${latitude}&lon=${longitude}&format=json`,
        );
        const cityName =
          result.address?.city ??
          result.address?.town ??
          result.address?.village;
        if (cityName) {
          navigateTo(
            `/weather/${encodeURIComponent(cityName)}` +
              `?lat=${latitude}&lon=${longitude}`,
          );
        }
      } finally {
        isLocating.value = false;
      }
    },
    () => {
      isLocating.value = false;
    },
  );
};

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
  };
}

// Fetch weather data — if coordinates are missing from the URL, geocode the
// city name and redirect to the same URL with coordinates added
const { data, pending, error } = useAsyncData(
  () =>
    `weather-${city.value}-${queryLat.value ?? "geo"}-${queryLon.value ?? "geo"}-${units.value}`,
  async () => {
    let lat: number;
    let lon: number;

    if (queryLat.value !== null && queryLon.value !== null) {
      lat = queryLat.value;
      lon = queryLon.value;
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

    const temperatureUnit =
      units.value === "imperial" ? "fahrenheit" : "celsius";
    const windSpeedUnit = units.value === "imperial" ? "mph" : "kmh";

    return await $fetch<WeatherResponse>(
      `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}` +
        `&timezone=auto&forecast_days=7`,
    );
  },
  { watch: [city, queryLat, queryLon, units] },
);

// Unwrap the raw AsyncData value for use in the template
const weatherData = computed(() => data.value ?? null);

// Helper functions for formatting and display
const weatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Light snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] ?? "Unknown";
};

// Map WMO weather codes to Meteocons icon names
const weatherIcon = (code: number): string => {
  const icons: Record<number, string> = {
    0: "clear-day",
    1: "mostly-clear-day",
    2: "partly-cloudy-day",
    3: "overcast",
    45: "fog",
    48: "fog",
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    61: "rain",
    63: "rain",
    65: "rain",
    71: "snow",
    73: "snow",
    75: "snow",
    77: "snow",
    80: "drizzle",
    81: "rain",
    82: "rain",
    85: "snow",
    86: "snow",
    95: "thunderstorms",
    96: "thunderstorms-hail",
    99: "thunderstorms-extreme",
  };
  return icons[code] ?? "not-available";
};

const formatHour = (timeString: string): string =>
  new Date(timeString).toLocaleTimeString([], {
    hour: "numeric",
    hour12: true,
  });

const formatDay = (dateString: string): string =>
  new Date(dateString).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const windDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8]!;
};
</script>

<template>
  <div
    class="grid h-full grid-cols-1 gap-4 pt-4 pr-6 pb-6 pl-4 lg:grid-cols-[3fr_2fr]">
    <div class="flex min-w-0 flex-col gap-4">
      <div class="relative flex gap-2">
        <!-- City search bar -->
        <div class="relative grow">
          <UInput
            v-model="searchQuery"
            placeholder="Search for a city..."
            :loading="searching"
            class="w-full"
            :ui="{ base: 'bg-slate-100 dark:bg-slate-900' }" />
          <div
            v-if="showResults"
            class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <button
              v-for="result in searchResults"
              :key="result.id"
              class="flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="navigateToCity(result)">
              <span class="font-medium">{{ result.name }}</span>
              <span class="text-xs text-slate-400">
                {{ [result.admin1, result.country].filter(Boolean).join(", ") }}
              </span>
            </button>
          </div>
        </div>

        <!-- Detect location button -->
        <UButton
          variant="outline"
          color="neutral"
          :loading="isLocating"
          @click="detectLocation"
          :ui="{ base: 'bg-slate-100 dark:bg-slate-900' }">
          <UIcon name="i-heroicons-map-pin" />
        </UButton>
      </div>

      <div v-if="pending" class="flex justify-center p-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <template v-else-if="weatherData">
        <!-- Current Conditions -->
        <div class="mb-4 flex items-center justify-between px-6">
          <div class="flex flex-col gap-2">
            <span class="text-2xl font-bold">{{ displayName }}</span>
            <div class="text-5xl font-bold">
              {{ Math.round(weatherData.current.temperature_2m) }}{{ tempUnit }}
            </div>
          </div>

          <div class="flex-col gap-2 text-center">
            <div
              v-if="!isDark"
              :style="{
                '--mask-url': `url('/meteocons/${iconFolder}/${weatherIcon(weatherData.current.weather_code)}.svg')`,
              }"
              class="mask-size-contain mask-position-center size-24 bg-slate-600 mask-(--mask-url) mask-alpha mask-no-repeat"
              :aria-label="weatherDescription(weatherData.current.weather_code)"
              role="img" />
            <img
              v-else
              :src="`/meteocons/${iconFolder}/${weatherIcon(weatherData.current.weather_code)}.svg`"
              :alt="weatherDescription(weatherData.current.weather_code)"
              class="size-24" />
            <div class="text-xs text-slate-600 dark:text-slate-400">
              {{ weatherDescription(weatherData.current.weather_code) }}
            </div>
          </div>
        </div>

        <!-- Today's Forecast -->
        <UCard
          :ui="{
            root: 'ring ring-slate-300 dark:ring-slate-800',
            body: 'bg-slate-100 dark:bg-slate-900',
          }">
          <div class="card-heading mb-6">Today's Forecast</div>

          <div
            class="flex divide-x divide-gray-300 overflow-x-auto dark:divide-gray-700">
            <div
              v-for="(time, i) in weatherData.hourly.time.slice(0, 24)"
              :key="time"
              class="flex min-w-18 flex-col items-center gap-1">
              <span class="text-xs text-slate-600 dark:text-slate-400">{{
                formatHour(time)
              }}</span>
              <div
                v-if="!isDark"
                :style="{
                  '--mask-url': `url('/meteocons/${iconFolder}/${weatherIcon(weatherData.hourly.weather_code[i]!)}.svg')`,
                }"
                class="mask-size-contain mask-position-center size-12 bg-slate-600 mask-(--mask-url) mask-alpha mask-no-repeat"
                :aria-label="
                  weatherDescription(weatherData.hourly.weather_code[i]!)
                "
                role="img" />
              <img
                v-else
                :src="`/meteocons/${iconFolder}/${weatherIcon(weatherData.hourly.weather_code[i]!)}.svg`"
                :alt="weatherDescription(weatherData.hourly.weather_code[i]!)"
                class="size-12" />

              <span class="text-sm font-medium">
                {{ Math.round(weatherData.hourly.temperature_2m[i]!) }}°
              </span>
            </div>
          </div>
        </UCard>

        <!-- Details -->
        <UCard
          :ui="{
            root: 'ring ring-slate-300 dark:ring-slate-800',
            body: 'bg-slate-100 dark:bg-slate-900',
          }"
          class="grow bg-slate-100 dark:bg-slate-900">
          <div class="card-heading mb-6">Details</div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="card-subheading">Feels like</div>
              <div class="text-lg font-bold">
                {{ Math.round(weatherData.current.apparent_temperature)
                }}{{ tempUnit }}
              </div>
            </div>

            <div>
              <div class="card-subheading">Humidity</div>
              <div class="text-lg font-bold">
                {{ weatherData.current.relative_humidity_2m }}%
              </div>
            </div>

            <div>
              <div class="card-subheading">Wind</div>
              <div class="text-lg font-bold">
                {{ Math.round(weatherData.current.wind_speed_10m) }}
                {{ speedUnit }}
                {{ windDirection(weatherData.current.wind_direction_10m) }}
              </div>
            </div>

            <div>
              <div class="card-subheading">Precipitation</div>
              <div class="text-lg font-bold">
                {{ weatherData.current.precipitation }} mm
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <UCard
        :ui="{
          root: 'ring ring-slate-300 dark:ring-slate-800',
          body: 'bg-slate-100 dark:bg-slate-900',
        }"
        v-else-if="error">
        <p class="text-red-500">{{ error.message }}</p>
      </UCard>
    </div>

    <div>
      <!-- 7-Day Forecast -->
      <UCard
        :ui="{
          root: 'ring ring-slate-300 dark:ring-slate-800',
          body: 'bg-slate-100 dark:bg-slate-900',
        }"
        class="h-full bg-slate-100 dark:bg-slate-900">
        <div class="card-heading mb-1">7-Day Forecast</div>

        <div
          v-if="weatherData"
          class="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
          <div
            v-for="(date, i) in weatherData.daily.time"
            :key="date"
            class="grid grid-cols-[30%_40%_30%] items-center py-2">
            <span class="text-xs">{{ formatDay(date) }}</span>

            <div class="flex items-center gap-1">
              <div
                v-if="!isDark"
                :style="{
                  '--mask-url': `url('/meteocons/${iconFolder}/${weatherIcon(weatherData.daily.weather_code[i]!)}.svg')`,
                }"
                class="mask-size-contain mask-position-center size-12 bg-slate-600 mask-(--mask-url) mask-alpha mask-no-repeat"
                :aria-label="
                  weatherDescription(weatherData.daily.weather_code[i]!)
                "
                role="img" />
              <img
                v-else
                :src="`/meteocons/${iconFolder}/${weatherIcon(weatherData.daily.weather_code[i]!)}.svg`"
                :alt="weatherDescription(weatherData.daily.weather_code[i]!)"
                class="size-12" />
              <span class="text-xs text-slate-600 dark:text-slate-400">
                {{ weatherDescription(weatherData.daily.weather_code[i]!) }}
              </span>
            </div>

            <span class="ml-auto text-xs font-medium">
              {{ Math.round(weatherData.daily.temperature_2m_max[i]!) }}° /
              {{ Math.round(weatherData.daily.temperature_2m_min[i]!) }}°
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
