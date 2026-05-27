<script setup lang="ts">
const props = defineProps<{
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
    <div class="card-heading mb-6">Today's Forecast</div>

    <div
      class="grid grid-cols-8 divide-x divide-slate-300 dark:divide-slate-700">
      <div
        v-for="i in hourlySlice"
        :key="times[i]!"
        role="group"
        :aria-label="`${formatHour(times[i]!)}, ${Math.round(temperatures[i]!)}°, ${weatherDescription(weatherCodes[i]!)}`"
        class="flex flex-col items-center gap-1">
        <span class="text-xs text-slate-600 dark:text-slate-400">{{
          formatHour(times[i]!)
        }}</span>
        <WeatherIcon
          :code="weatherCodes[i]!"
          :isDay="isDays[i]!"
          size="size-12" />

        <span class="text-sm font-medium">
          {{ Math.round(temperatures[i]!) }}°
        </span>
      </div>
    </div>
  </UCard>
</template>
