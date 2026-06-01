<script setup lang="ts">
const props = defineProps<{
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDegrees: number;
  precipitation: number;
  precipProbability: number;
  pressure: string; // already formatted by formatPressure
  visibility: string; // already formatted by formatVisibility
  dewPoint: number;
  windGusts: number;
  cloudCover: number;
  tempUnit: string;
  speedUnit: "mph" | "km/h";
  precipUnit: string;
}>();

const windDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8]!;
};

const { windSockIcon } = useWmoCode();
</script>

<template>
  <UCard class="grow bg-slate-100 dark:bg-slate-900">
    <div class="card-heading mb-6">Details</div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="flex items-center">
          <MeteoIcon name="thermometer" size="size-10 -ml-4" />
          <div>
            <div class="card-subheading">Feels Like</div>
            <div class="text-lg font-bold">
              {{ Math.round(props.feelsLike) }}{{ props.tempUnit }}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div class="flex items-center">
            <MeteoIcon name="raindrop" size="size-10 -ml-4" />
            <div>
              <div class="card-subheading">Dew Point</div>
              <div class="text-lg font-bold">
                {{ Math.round(props.dewPoint) }}{{ props.tempUnit }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div class="flex items-center">
            <MeteoIcon name="humidity" size="size-10 -ml-4" />
            <div>
              <div class="card-subheading">Humidity</div>
              <div class="text-lg font-bold">{{ props.humidity }}%</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card-subheading">Pressure</div>
        <div class="text-lg font-bold">
          {{ props.pressure }}
        </div>
      </div>

      <div>
        <div>
          <div class="flex items-center">
            <MeteoIcon name="wind" size="size-10 -ml-4" />
            <div>
              <div class="card-subheading">Wind</div>
              <div class="text-lg font-bold">
                {{ Math.round(props.windSpeed) }}
                {{ props.speedUnit }}
                {{ windDirection(props.windDegrees) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div class="flex items-center">
            <MeteoIcon
              :name="windSockIcon(props.windGusts, props.speedUnit)"
              size="size-10 -ml-3 -mr-1" />
            <div>
              <div class="card-subheading">Wind Gusts</div>
              <div class="text-lg font-bold">
                {{ Math.round(props.windGusts) }}
                {{ props.speedUnit }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card-subheading">Precipitation</div>
        <div class="text-lg font-bold">
          {{ props.precipitation }} {{ props.precipUnit }}
        </div>
      </div>

      <div>
        <div class="card-subheading">Chance of Precipitation</div>
        <div class="text-lg font-bold">{{ props.precipProbability }}%</div>
      </div>

      <div>
        <div class="card-subheading">Cloud Cover</div>
        <div class="text-lg font-bold">{{ props.cloudCover }}%</div>
      </div>

      <div>
        <div class="card-subheading">Visibility</div>
        <div class="text-lg font-bold">
          {{ props.visibility }}
        </div>
      </div>
    </div>
  </UCard>
</template>
