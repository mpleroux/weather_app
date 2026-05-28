<script setup lang="ts">
const props = defineProps<{
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDegrees: number;
  precipitation: number;
  tempUnit: string;
  speedUnit: string;
}>();

const windDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8]!;
};
</script>

<template>
  <UCard class="grow bg-slate-100 dark:bg-slate-900">
    <div class="card-heading mb-6">Details</div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="card-subheading">Feels like</div>
        <div class="text-lg font-bold">
          {{ Math.round(props.feelsLike) }}{{ props.tempUnit }}
        </div>
      </div>

      <div>
        <div class="card-subheading">Humidity</div>
        <div class="text-lg font-bold">{{ props.humidity }}%</div>
      </div>

      <div>
        <div class="card-subheading">Wind</div>
        <div class="text-lg font-bold">
          {{ Math.round(props.windSpeed) }}
          {{ props.speedUnit }}
          {{ windDirection(props.windDegrees) }}
        </div>
      </div>

      <div>
        <div class="card-subheading">Precipitation</div>
        <div class="text-lg font-bold">{{ props.precipitation }} mm</div>
      </div>
    </div>
  </UCard>
</template>
