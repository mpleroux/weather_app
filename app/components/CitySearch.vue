<script setup lang="ts">
// Pull in search state and navigation from the shared composable
const { searchQuery, searchResults, searching, showResults, navigateToCity } =
  useCitySearch();

// Geolocation state
const isLocating = ref<boolean>(false);

// Detect the user's location via the browser Geolocation API,
// then reverse geocode with Nominatim to get a city name for the URL
const detectLocation = (): void => {
  if (!navigator.geolocation) return;
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const result = await $fetch<{
          address: {
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            country?: string;
          };
        }>(
          `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${latitude}&lon=${longitude}&format=json`,
        );
        const cityName =
          result.address?.city ??
          result.address?.town ??
          result.address?.village;
        if (cityName) {
          navigateTo(
            `/weather/${encodeURIComponent(cityName)}` +
              `?lat=${latitude}&lon=${longitude}`,
          );
        }
      } finally {
        isLocating.value = false;
      }
    },
    () => {
      isLocating.value = false;
    },
    { enableHighAccuracy: false, timeout: 10000 },
  );
};
</script>

<template>
  <div class="relative flex gap-2">
    <!-- City search bar -->
    <div class="relative grow">
      <UInput
        v-model="searchQuery"
        placeholder="Search for a city..."
        :loading="searching"
        name="city-search"
        role="combobox"
        class="w-full"
        :ui="{ base: 'text-sm bg-slate-100 dark:bg-slate-900' }"
        aria-autocomplete="list"
        aria-controls="city-search-results"
        :aria-expanded="showResults.toString()"
        aria-label="Search for a city" />

      <div
        v-if="showResults"
        id="city-search-results"
        role="listbox"
        aria-label="City search results"
        class="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-slate-100 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div
          v-for="result in searchResults"
          :key="result.id"
          role="option"
          tabindex="0"
          class="flex w-full cursor-pointer flex-col px-4 py-2 text-left text-sm hover:bg-slate-200 dark:hover:bg-slate-800"
          @click="navigateToCity(result)"
          @keydown.enter="navigateToCity(result)">
          <span class="font-medium">{{ result.name }}</span>
          <span class="text-xs text-slate-600 dark:text-slate-400">
            {{ [result.admin1, result.country].filter(Boolean).join(", ") }}
          </span>
        </div>
      </div>
    </div>

    <!-- Detect location button -->
    <UButton
      variant="outline"
      :loading="isLocating"
      :ui="{
        base: 'bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
      }"
      @click="detectLocation">
      <UIcon name="i-heroicons-map-pin" />
    </UButton>
  </div>
</template>
