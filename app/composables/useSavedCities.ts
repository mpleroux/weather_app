// Shape of a saved city entry stored in localStorage
export interface SavedCity {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

export const useSavedCities = () => {
  // Shared cities list — initialized from localStorage on the client
  const cities = useState<SavedCity[]>("savedCities", () => {
    if (import.meta.client) {
      const stored = localStorage.getItem("savedCities");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Add a city if it isn't already in the list, then persist to localStorage
  const addCity = (city: SavedCity): void => {
    const exists = cities.value.some(
      (c) => c.lat === city.lat && c.lon === city.lon,
    );
    if (!exists) cities.value = [city, ...cities.value];
    if (import.meta.client) {
      localStorage.setItem("savedCities", JSON.stringify(cities.value));
    }
  };

  return { cities, addCity };
};
