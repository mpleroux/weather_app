<script setup lang="ts">
const route = useRoute();
const city = computed(() => route.params.city as string)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[3fr_2fr] h-full gap-4 p-6">
    <div class="flex flex-col gap-4">
      <UInput placeholder="Search for a city..." />

      <UCard>
        <template #header>Current Conditions</template>
        {{ city }}
      </UCard>

      <UCard>
        <template #header>Today's Forecast</template>
        Hourly forecast goes here
      </UCard>

      <UCard>
        <template #header>Details</template>
        Feels like, wind, humidity...
      </UCard>
    </div>

    <div>
      <UCard class="h-full">
        <template #header>7-Day Forecast</template>
        Daily forecast goes here
      </UCard>
    </div>
  </div>
</template>
