<script setup lang="ts">
const props = defineProps<{
  displayName: string;
  temperature: number;
  weatherCode: number;
  isDay: number;
  tempUnit: string;
}>();

const { weatherDescription } = useWmoCode();
</script>

<template>
  <!-- Current Conditions -->
  <div class="mb-4 flex items-center justify-between px-1 md:px-4">
    <div class="flex flex-col gap-2">
      <span class="text-sm font-bold md:text-base">{{
        props.displayName
      }}</span>
      <div class="text-3xl font-bold md:text-4xl">
        {{ Math.round(props.temperature) }}{{ props.tempUnit }}
      </div>
    </div>

    <div class="flex-col text-center">
      <WeatherIcon
        :code="props.weatherCode"
        :isDay="props.isDay"
        size="size-24 md:size-32" />

      <div class="text-xs text-slate-600 dark:text-slate-400">
        {{ weatherDescription(props.weatherCode) }}
      </div>
    </div>
  </div>
</template>
