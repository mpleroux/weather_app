<script setup lang="ts">
// Redirect returning users to their last visited city
onMounted(() => {
  const lastCityUrl = localStorage.getItem("lastCityUrl");
  if (lastCityUrl) navigateTo(lastCityUrl);
});

// Pull in search state and navigation from the shared composable
const { searchQuery, searchResults, searching, showResults, navigateToCity } =
  useCitySearch();

// Geolocation state
const isLocating = ref<boolean>(false);
const locationError = ref<string>("");

// Detect the user's location via the browser Geolocation API,
// then reverse geocode with Nominatim to get a city name for the URL
const detectLocation = (): void => {
  if (!navigator.geolocation) {
    locationError.value = "Geolocation is not supported by your browser.";
    return;
  }
  isLocating.value = true;
  locationError.value = "";
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
        const city =
          result.address?.city ??
          result.address?.town ??
          result.address?.village;
        if (city) {
          navigateTo(
            `/weather/${encodeURIComponent(city)}` +
              `?lat=${latitude}&lon=${longitude}`,
          );
        } else {
          locationError.value =
            "Could not determine your city. Please search manually.";
        }
      } catch {
        locationError.value =
          "Could not retrieve location data. Please search manually.";
      } finally {
        isLocating.value = false;
      }
    },
    () => {
      locationError.value =
        "Location permission denied. Please search manually.";
      isLocating.value = false;
    },
  );
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-8 p-6">
    <div class="flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-cloud" class="text-primary text-6xl" />
      <h1 class="text-3xl font-semibold">Weather</h1>
    </div>

    <div class="flex w-full max-w-md flex-col gap-4">
      <div class="relative">
        <UInput
          v-model="searchQuery"
          placeholder="Search for a city..."
          :loading="searching"
        />
        <div
          v-if="showResults"
          class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="navigateToCity(result)"
          >
            <span class="font-medium">{{ result.name }}</span>
            <span class="text-xs text-gray-400">
              {{ [result.admin1, result.country].filter(Boolean).join(", ") }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-px grow shrink basis-0 bg-gray-200 dark:bg-gray-700" />
        <span class="text-sm text-gray-400">or</span>
        <div class="h-px grow shrink basis-0 bg-gray-200 dark:bg-gray-700" />
      </div>

      <UButton
        variant="outline"
        :loading="isLocating"
        block
        @click="detectLocation"
      >
        Use my location
      </UButton>

      <p v-if="locationError" class="text-center text-sm text-red-500">
        {{ locationError }}
      </p>
    </div>
  </div>
</template>
