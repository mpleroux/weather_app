<script setup lang="ts">
const {
  temperatureUnit,
  windSpeedUnit,
  pressureUnit,
  precipUnit,
  distanceUnit,
} = useUnits();

const toast = useToast();

watch(
  [temperatureUnit, windSpeedUnit, pressureUnit, precipUnit, distanceUnit],
  () => {
    toast.add({ title: "Settings updated." });
  },
);
</script>

<template>
  <div
    class="grid h-full grid-cols-1 gap-4 pt-4 pr-6 pb-4 pl-4 lg:grid-cols-[3fr_2fr]">
    <div class="flex min-w-0 flex-col gap-4">
      <h1 class="font-bold">Units</h1>

      <UCard>
        <div class="mb-8">
          <SettingRow
            v-model="temperatureUnit"
            label="Temperature"
            :options="[
              { value: 'F', label: 'Fahrenheit' },
              { value: 'C', label: 'Celsius' },
            ]" />
        </div>

        <div class="mb-8">
          <SettingRow
            v-model="windSpeedUnit"
            label="Wind Speed"
            :options="[
              { value: 'mph', label: 'mph' },
              { value: 'km/h', label: 'km/h' },
            ]" />
        </div>

        <div class="mb-8">
          <SettingRow
            v-model="pressureUnit"
            label="Pressure"
            :options="[
              { value: 'inHg', label: 'inHg' },
              { value: 'hPa', label: 'hPa' },
            ]" />
        </div>

        <div class="mb-8">
          <SettingRow
            v-model="precipUnit"
            label="Precipitation"
            :options="[
              { value: 'in', label: 'Inches' },
              { value: 'mm', label: 'Millimeters' },
            ]" />
        </div>

        <div class="mb-8">
          <SettingRow
            v-model="distanceUnit"
            label="Visibility"
            :options="[
              { value: 'mi', label: 'Miles' },
              { value: 'km', label: 'Kilometers' },
            ]" />
        </div>
      </UCard>
    </div>

    <div />
  </div>
</template>
