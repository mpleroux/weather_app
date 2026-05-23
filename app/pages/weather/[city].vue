<script setup lang="ts">
const route = useRoute();
const { units, tempUnit, speedUnit } = useUnits();

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
  { watch: [queryLat, queryLon] },
);

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
  <div class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] h-full gap-4 p-6">
    <div class="flex flex-col gap-4 min-w-0">
      <div class="relative flex gap-2">
        <div class="relative grow">
          <UInput
            v-model="searchQuery"
            placeholder="Search for a city..."
            :loading="searching"
          />
          <div
            v-if="showResults"
            class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            <button
              v-for="result in searchResults"
              :key="result.id"
              class="flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="navigateToCity(result)"
            >
              <span class="font-medium">{{ result.name }}</span>
              <span class="text-xs text-gray-400">
                {{ [result.admin1, result.country].filter(Boolean).join(", ") }}
              </span>
            </button>
          </div>
        </div>
        <UButton
          variant="outline"
          :loading="isLocating"
          @click="detectLocation"
        >
          <UIcon name="i-heroicons-map-pin" />
        </UButton>
      </div>

      <div v-if="pending" class="flex justify-center p-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
      </div>

      <template v-else-if="weatherData">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span>Current Conditions</span>
              <span class="text-sm text-gray-400">{{ displayName }}</span>
            </div>
          </template>
          <div class="flex flex-col gap-2">
            <div class="text-5xl font-bold">
              {{ Math.round(weatherData.current.temperature_2m) }}{{ tempUnit }}
            </div>
            <div class="text-lg text-gray-500">
              {{ weatherDescription(weatherData.current.weather_code) }}
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>Today's Forecast</template>
          <div class="flex gap-4 overflow-x-auto">
            <div
              v-for="(time, i) in weatherData.hourly.time.slice(0, 24)"
              :key="time"
              class="flex min-w-12 flex-col items-center gap-1"
            >
              <span class="text-xs text-gray-400">{{ formatHour(time) }}</span>
              <span class="text-sm font-medium">
                {{ Math.round(weatherData.hourly.temperature_2m[i]!) }}°
              </span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>Details</template>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-400">Feels like</div>
              <div class="font-medium">
                {{ Math.round(weatherData.current.apparent_temperature)
                }}{{ tempUnit }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Humidity</div>
              <div class="font-medium">
                {{ weatherData.current.relative_humidity_2m }}%
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Wind</div>
              <div class="font-medium">
                {{ Math.round(weatherData.current.wind_speed_10m) }}
                {{ speedUnit }}
                {{ windDirection(weatherData.current.wind_direction_10m) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Precipitation</div>
              <div class="font-medium">
                {{ weatherData.current.precipitation }} mm
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <UCard v-else-if="error">
        <p class="text-red-500">{{ error.message }}</p>
      </UCard>
    </div>

    <div>
      <UCard class="h-full">
        <template #header>7-Day Forecast</template>
        <div v-if="weatherData" class="flex flex-col gap-3">
          <div
            v-for="(date, i) in weatherData.daily.time"
            :key="date"
            class="flex items-center justify-between"
          >
            <span class="w-24 text-sm">{{ formatDay(date) }}</span>
            <span class="text-sm text-gray-400">
              {{ weatherDescription(weatherData.daily.weather_code[i]!) }}
            </span>
            <span class="text-sm font-medium">
              {{ Math.round(weatherData.daily.temperature_2m_max[i]!) }}° /
              {{ Math.round(weatherData.daily.temperature_2m_min[i]!) }}°
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
