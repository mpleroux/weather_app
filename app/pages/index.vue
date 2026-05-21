<script setup lang="ts">
interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
  };
}

const query = ref<string>("");
const isLocating = ref<boolean>(false);
const locationError = ref<string>("");

const search = (): void => {
  const city = query.value.trim();
  if (!city) return;
  navigateTo(`/weather/${encodeURIComponent(city)}`);
};

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
        const result = await $fetch<NominatimResponse>(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        );
        const city =
          result.address?.city ??
          result.address?.town ??
          result.address?.village;
        if (city) {
          navigateTo(`/weather/${encodeURIComponent(city)}`);
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
  <div class="flex flex-col items-center justify-center h-full gap-8 p-6">
    <div class="flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-cloud" class="text-6xl text-primary" />
      <h1 class="text-3xl font-semibold">Weather</h1>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-md">
      <form class="flex gap-2" @submit.prevent="search">
        <UInput
          v-model="query"
          placeholder="Search for a city..."
          class="grow shrink basis-0"
        />
        <UButton type="submit">Search</UButton>
      </form>

      <div class="flex items-center gap-3">
        <div class="grow shrink basis-0 h-px bg-gray-200 dark:bg-gray-700" />
        <span class="text-sm text-gray-400">or</span>
        <div class="grow shrink basis-0 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <UButton
        variant="outline"
        :loading="isLocating"
        block
        @click="detectLocation"
      >
        Use my location
      </UButton>

      <p v-if="locationError" class="text-sm text-red-500 text-center">
        {{ locationError }}
      </p>
    </div>
  </div>
</template>
