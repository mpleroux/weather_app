export const useUnits = () => {
  // Shared unit preference — initialize from localStorage on the client,
  // default to imperial on the server to avoid SSR mismatch
  const units = useState<"imperial" | "metric">("units", () => {
    if (import.meta.client) {
      return (
        (localStorage.getItem("units") as "imperial" | "metric") ?? "imperial"
      );
    }
    return "imperial";
  });

  // Persist the unit preference to localStorage whenever it changes
  watch(units, (value) => {
    if (import.meta.client) {
      localStorage.setItem("units", value);
    }
  });

  // Toggle between imperial and metric
  const toggleUnits = (): void => {
    units.value = units.value === "imperial" ? "metric" : "imperial";
  };

  // Derived display strings used throughout the app
  const tempUnit = computed<string>(() =>
    units.value === "imperial" ? "°F" : "°C",
  );
  const speedUnit = computed<string>(() =>
    units.value === "imperial" ? "mph" : "km/h",
  );

  return {
    units,
    toggleUnits,
    tempUnit,
    speedUnit,
  };
};
