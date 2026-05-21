export const useUnits = () => {
  const units = useState<"imperial" | "metric">("units", () => {
    if (import.meta.client) {
      return (
        (localStorage.getItem("units") as "imperial" | "metric") ?? "imperial"
      );
    }
    return "imperial";
  });

  watch(units, (value) => {
    if (import.meta.client) {
      localStorage.setItem("units", value);
    }
  });

  const toggleUnits = (): void => {
    units.value = units.value === "imperial" ? "metric" : "imperial";
  };

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
