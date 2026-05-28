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

const { weatherData, pending, error, refresh } = useWeatherData(
  city,
  queryLat,
  queryLon,
  units,
);

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
        <CitySearch />

        <div v-if="pending" class="flex justify-center p-8">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
        </div>

        <template v-else-if="weatherData">
          <CurrentConditions
            :display-name="displayName"
            :temperature="weatherData.current.temperature_2m"
            :weather-code="weatherData.current.weather_code"
            :is-day="weatherData.current.is_day"
            :temp-unit="tempUnit" />

          <HourlyForecast
            :times="weatherData.hourly.time"
            :temperatures="weatherData.hourly.temperature_2m"
            :weather-codes="weatherData.hourly.weather_code"
            :is-days="weatherData.hourly.is_day"
            :hourly-slice="hourlySlice" />

          <WeatherDetails
            :feels-like="weatherData.current.apparent_temperature"
            :humidity="weatherData.current.relative_humidity_2m"
            :wind-speed="weatherData.current.wind_speed_10m"
            :wind-degrees="weatherData.current.wind_direction_10m"
            :precipitation="weatherData.current.precipitation"
            :temp-unit="tempUnit"
            :speed-unit="speedUnit" />
        </template>
      </div>

      <div v-if="weatherData">
        <DailyForecast
          :times="weatherData.daily.time"
          :weather-codes="weatherData.daily.weather_code"
          :max-temps="weatherData.daily.temperature_2m_max"
          :min-temps="weatherData.daily.temperature_2m_min" />
      </div>
    </div>
  </div>
</template>
