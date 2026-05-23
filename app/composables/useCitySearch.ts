// Shape of a single result from the Open-Meteo Geocoding API
export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export const useCitySearch = () => {
  // Search input state
  const searchQuery = ref<string>("");
  const searchResults = ref<GeoResult[]>([]);
  const searching = ref<boolean>(false);

  // Only show the results dropdown when the query is long enough and results exist
  const showResults = computed<boolean>(
    () => searchResults.value.length > 0 && searchQuery.value.length >= 2,
  );

  // Debounced city search — wait for the user to stop typing before fetching
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, (q) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      searchResults.value = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      searching.value = true;
      try {
        const response = await $fetch<{ results?: GeoResult[] }>(
          `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,
        );
        searchResults.value = response.results ?? [];
      } finally {
        searching.value = false;
      }
    }, 300);
  });

  // Navigate to a city selected from the search results dropdown
  const navigateToCity = (result: GeoResult): void => {
    navigateTo(
      `/weather/${encodeURIComponent(result.name)}` +
        `?lat=${result.latitude}&lon=${result.longitude}`,
    );
  };

  return { searchQuery, searchResults, searching, showResults, navigateToCity };
};
