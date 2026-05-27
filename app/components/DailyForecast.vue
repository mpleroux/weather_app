<script setup lang="ts">
const props = defineProps<{
  times: string[];
  weatherCodes: number[];
  maxTemps: number[];
  minTemps: number[];
}>();

const formatDay = (dateString: string): string =>
  new Date(dateString + "T00:00").toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const { weatherDescription } = useWmoCode();
</script>

<template>
  <UCard class="h-full bg-slate-100 dark:bg-slate-900">
    <div class="card-heading mb-1">7-Day Forecast</div>

    <div class="flex flex-col divide-y divide-slate-300 dark:divide-slate-700">
      <div
        v-for="(date, i) in times"
        :key="date"
        class="grid grid-cols-[30%_40%_30%] items-center py-2">
        <span class="text-xs">{{ formatDay(date) }}</span>

        <div class="flex items-center gap-1">
          <WeatherIcon :code="weatherCodes[i]!" :isDay="1" size="size-12" />

          <span class="text-xs text-slate-600 dark:text-slate-400">
            {{ weatherDescription(weatherCodes[i]!) }}
          </span>
        </div>

        <span class="ml-auto text-xs font-medium">
          {{ Math.round(maxTemps[i]!) }}° / {{ Math.round(minTemps[i]!) }}°
        </span>
      </div>
    </div>
  </UCard>
</template>
