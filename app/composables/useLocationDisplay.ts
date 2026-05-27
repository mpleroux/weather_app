export const useLocationDisplay = (
  lat: Ref<number | null>,
  lon: Ref<number | null>,
  cityFallback: Ref<string>,
) => {
  // Reverse geocode coordinates to a human-readable location name (city, region, country)
  interface NominatimAddress {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country_code?: string;
  }

  interface NominatimResponse {
    address: NominatimAddress;
  }

  const { data: locationData } = useAsyncData(
    () => `nominatim-${lat.value}-${lon.value}`,
    async () => {
      if (lat.value === null || lon.value === null) return null;
      return await $fetch<NominatimResponse>(
        `https://nominatim.openstreetmap.org/reverse` +
          `?lat=${lat.value}&lon=${lon.value}&format=json`,
      );
    },
    { watch: [lat, lon], server: false },
  );

  // Build the display name from the Nominatim response; fall back to the URL slug if not yet resolved
  const displayName = computed<string>(() => {
    const addr = locationData.value?.address;
    if (!addr) return cityFallback.value;
    return [
      addr.city ?? addr.town ?? addr.village,
      addr.state,
      addr.country_code?.toUpperCase(),
    ]
      .filter(Boolean)
      .join(", ");
  });

  return { displayName };
};
