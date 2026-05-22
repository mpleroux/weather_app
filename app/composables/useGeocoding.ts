import type { Ref } from "vue";

// Raw Geocoding API response shape
interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

// Clean shape exposed to components
export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  region?: string;
  timezone: string;
}

export const useGeocoding = (query: Ref<string>) => {
  const url = computed<string>(() => {
    return (
      `https://geocoding-api.open-meteo.com/v2/search` +
      `?name=${encodeURIComponent(query.value)}&count=5&language=en&format=json`
    );
  });

  const { data, pending, error } = useFetch<GeocodingResponse>(url);

  const results = computed<Location[]>(() => {
    if (query.value.length < 2 || !data.value?.results) return [];
    return data.value.results.map((r: GeocodingResult) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      countryCode: r.country_code,
      region: r.admin1,
      timezone: r.timezone,
    }));
  });

  return { results, pending, error };
};
