<script setup lang="ts">
const {
  temperatureUnit,
  windSpeedUnit,
  pressureUnit,
  precipUnit,
  distanceUnit,
} = useUnits();
</script>

<template>
  <div
    class="grid h-full grid-cols-1 gap-4 pt-4 pr-6 pb-4 pl-4 lg:grid-cols-[3fr_2fr]">
    <div class="flex min-w-0 flex-col gap-4">
      <h1 class="font-bold">Units</h1>

      <UCard>
        <div class="mb-8">
          <h2 class="settings-heading">Temperature</h2>

          <div class="mb-4">
            <UFieldGroup orientation="horizontal" class="flex">
              <UButton
                class="settings-button"
                color="neutral"
                :variant="temperatureUnit === 'F' ? 'subtle' : 'outline'"
                label="Fahrenheit"
                @click="temperatureUnit = 'F'" />
              <UButton
                class="settings-button"
                color="neutral"
                :variant="temperatureUnit === 'C' ? 'subtle' : 'outline'"
                label="Celsius"
                @click="temperatureUnit = 'C'" />
            </UFieldGroup>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="settings-heading">Wind Speed</h2>

          <div class="mb-4">
            <UFieldGroup orientation="horizontal" class="flex">
              <UButton
                class="settings-button"
                color="neutral"
                :variant="windSpeedUnit === 'mph' ? 'subtle' : 'outline'"
                label="mph"
                @click="windSpeedUnit = 'mph'" />
              <UButton
                class="settings-button"
                color="neutral"
                :variant="windSpeedUnit === 'km/h' ? 'subtle' : 'outline'"
                label="km/h"
                @click="windSpeedUnit = 'km/h'" />
            </UFieldGroup>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="settings-heading">Pressure</h2>

          <div class="mb-4">
            <UFieldGroup orientation="horizontal" class="flex">
              <UButton
                class="settings-button"
                color="neutral"
                :variant="pressureUnit === 'inHg' ? 'subtle' : 'outline'"
                label="inHg"
                @click="pressureUnit = 'inHg'" />
              <UButton
                class="settings-button"
                color="neutral"
                :variant="pressureUnit === 'hPa' ? 'subtle' : 'outline'"
                label="hPa"
                @click="pressureUnit = 'hPa'" />
            </UFieldGroup>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="settings-heading">Precipitation</h2>

          <div class="mb-4">
            <UFieldGroup orientation="horizontal" class="flex">
              <UButton
                class="settings-button"
                color="neutral"
                :variant="precipUnit === 'in' ? 'subtle' : 'outline'"
                label="Inches"
                @click="precipUnit = 'in'" />
              <UButton
                class="settings-button"
                color="neutral"
                :variant="precipUnit === 'mm' ? 'subtle' : 'outline'"
                label="Millimeters"
                @click="precipUnit = 'mm'" />
            </UFieldGroup>
          </div>
        </div>

        <div>
          <h2 class="settings-heading">Visibility</h2>

          <div class="mb-4">
            <UFieldGroup orientation="horizontal" class="flex">
              <UButton
                class="settings-button"
                color="neutral"
                :variant="distanceUnit === 'mi' ? 'subtle' : 'outline'"
                label="Miles"
                @click="distanceUnit = 'mi'" />
              <UButton
                class="settings-button"
                color="neutral"
                :variant="distanceUnit === 'km' ? 'subtle' : 'outline'"
                label="Kilometers"
                @click="distanceUnit = 'km'" />
            </UFieldGroup>
          </div>
        </div>
      </UCard>
    </div>

    <div />
  </div>
</template>
