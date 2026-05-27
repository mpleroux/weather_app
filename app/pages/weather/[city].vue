<script setup lang="ts">
// Read route params, query strings, and unit preferences
const route = useRoute();
const { units, tempUnit, speedUnit } = useUnits();

// Parse the city slug and coordinates from the URL
const city = computed<string>(() => route.params.city as string);
const queryLat = computed<number | null>(() =>
  route.query.lat ? parseFloat(route.query.lat as string) : null,
);
const queryLon = computed<number | null>(() =>
  route.query.lon ? parseFloat(route.query.lon as string) : null,
);

const { displayName } = useLocationDisplay(queryLat, queryLon, city);

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
        `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
        `&hourly=temperature_2m,weather_code,precipitation_probability,is_day` +
        `&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}` +
        `&timezone=auto&forecast_days=7`,
    );
  },
  { watch: [city, queryLat, queryLon, units] },
);

// Unwrap the raw AsyncData value for use in the template
const weatherData = computed(() => data.value ?? null);

const { weatherDescription } = useWmoCode();

const formatHour = (timeString: string): string =>
  new Date(timeString).toLocaleTimeString([], {
    hour: "numeric",
    hour12: true,
  });

const formatDay = (dateString: string): string =>
  new Date(dateString + "T00:00").toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const windDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8]!;
};

// Compute indices into the hourly data for the next 24 hours,
// sampled every 3 hours starting from the current hour.
const hourlySlice = computed(() => {
  if (!weatherData.value) return [];

  const currentTime = weatherData.value.current.time;
  const hourlyTime = weatherData.value.hourly.time;
  const startIndex = hourlyTime.findIndex((t) => t >= currentTime);

  const returnArray: number[] = [];
  for (let i = 0; i <= 21; i += 3) {
    returnArray.push(startIndex + i);
  }

  return returnArray;
});
</script>

<template>
  <div class="h-full">
    <div
      v-if="error"
      class="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="size-12 text-slate-400" />
      <p class="text-lg font-semibold">
        Weather data is temporarily unavailable
      </p>
      <p class="pb-4 text-sm text-slate-600 dark:text-slate-400">
        Please try again in a moment.
      </p>
      <UButton
        variant="outline"
        color="neutral"
        :loading="pending"
        @click="() => refresh()"
        >Try again</UButton
      >
    </div>
    <div
      v-else
      class="grid h-full grid-cols-1 gap-4 pt-4 pr-6 pb-4 pl-4 lg:grid-cols-[3fr_2fr]">
      <div class="flex min-w-0 flex-col gap-4">
        <div class="relative flex gap-2">
          <!-- City search bar -->
          <div class="relative grow">
            <UInput
              v-model="searchQuery"
              placeholder="Search for a city..."
              :loading="searching"
              role="combobox"
              class="w-full"
              :ui="{ base: 'text-sm bg-slate-100 dark:bg-slate-900' }"
              aria-autocomplete="list"
              aria-controls="city-search-results"
              :aria-expanded="showResults.toString()"
              aria-label="Search for a city" />

            <div
              v-if="showResults"
              id="city-search-results"
              role="listbox"
              aria-label="City search results"
              class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div
                v-for="result in searchResults"
                :key="result.id"
                role="option"
                tabindex="0"
                class="flex w-full cursor-pointer flex-col px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="navigateToCity(result)"
                @keydown.enter="navigateToCity(result)">
                <span class="font-medium">{{ result.name }}</span>
                <span class="text-xs text-slate-600 dark:text-slate-400">
                  {{
                    [result.admin1, result.country].filter(Boolean).join(", ")
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Detect location button -->
          <UButton
            variant="outline"
            :loading="isLocating"
            @click="detectLocation"
            :ui="{
              base: 'bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
            }">
            <UIcon name="i-heroicons-map-pin" />
          </UButton>
        </div>

        <div v-if="pending" class="flex justify-center p-8">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
        </div>

        <template v-else-if="weatherData">
          <!-- Current Conditions -->
          <div class="mb-4 flex items-center justify-between px-1 md:px-4">
            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold md:text-base">{{
                displayName
              }}</span>
              <div class="text-3xl font-bold md:text-4xl">
                {{ Math.round(weatherData.current.temperature_2m)
                }}{{ tempUnit }}
              </div>
            </div>

            <div class="flex-col text-center">
              <WeatherIcon
                :code="weatherData.current.weather_code"
                :isDay="weatherData.current.is_day"
                size="size-24 md:size-32" />

              <div class="text-xs text-slate-600 dark:text-slate-400">
                {{ weatherDescription(weatherData.current.weather_code) }}
              </div>
            </div>
          </div>

          <!-- Today's Hourly Forecast -->
          <UCard>
            <div class="card-heading mb-6">Today's Forecast</div>

            <div
              class="grid grid-cols-8 divide-x divide-gray-300 dark:divide-gray-700">
              <div
                v-for="i in hourlySlice"
                :key="weatherData.hourly.time[i]!"
                role="group"
                :aria-label="`${formatHour(weatherData.hourly.time[i]!)}, ${Math.round(weatherData.hourly.temperature_2m[i]!)}°, ${weatherDescription(weatherData.hourly.weather_code[i]!)}`"
                class="flex flex-col items-center gap-1">
                <span class="text-xs text-slate-600 dark:text-slate-400">{{
                  formatHour(weatherData.hourly.time[i]!)
                }}</span>
                <WeatherIcon
                  :code="weatherData.hourly.weather_code[i]!"
                  :isDay="weatherData.hourly.is_day[i]!"
                  size="size-12" />

                <span class="text-sm font-medium">
                  {{ Math.round(weatherData.hourly.temperature_2m[i]!) }}°
                </span>
              </div>
            </div>
          </UCard>

          <!-- Details -->
          <UCard class="grow bg-slate-100 dark:bg-slate-900">
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
      </div>

      <div>
        <!-- 7-Day Forecast -->
        <UCard class="h-full bg-slate-100 dark:bg-slate-900">
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
                <WeatherIcon
                  :code="weatherData.daily.weather_code[i]!"
                  :isDay="1"
                  size="size-12" />

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
  </div>
</template>
