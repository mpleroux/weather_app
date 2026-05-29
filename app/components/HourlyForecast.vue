<script setup lang="ts">
defineProps<{
  times: string[];
  temperatures: number[];
  weatherCodes: number[];
  isDays: number[];
  hourlySlice: number[];
}>();

const formatHour = (timeString: string): string =>
  new Date(timeString).toLocaleTimeString([], {
    hour: "numeric",
    hour12: true,
  });

const { weatherDescription } = useWmoCode();
</script>

<template>
  <UCard>
    <div class="card-heading mb-6">Hourly Forecast</div>

    <div class="overflow-x-auto">
      <div class="flex divide-x divide-slate-300 dark:divide-slate-700">
        <div
          v-for="i in hourlySlice"
          :key="times[i]!"
          role="group"
          :aria-label="`${formatHour(times[i]!)}, ${Math.round(temperatures[i]!)}°, ${weatherDescription(weatherCodes[i]!)}`"
          class="flex shrink-0 flex-col items-center gap-1 px-4">
          <span class="text-xs text-slate-600 dark:text-slate-400">{{
            formatHour(times[i]!)
          }}</span>
          <WeatherIcon
            :code="weatherCodes[i]!"
            :is-day="isDays[i]!"
            size="size-12" />

          <span class="text-sm font-medium">
            {{ Math.round(temperatures[i]!) }}°
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>
