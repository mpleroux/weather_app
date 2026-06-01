export const useUnits = () => {
  // Each unit preference is stored in localStorage and initialized on the client.
  // useState keys are namespaced with "unit-" to avoid collisions.
  const temperatureUnit = useState<"F" | "C">("unit-temperature", () => {
    if (import.meta.client) {
      return (localStorage.getItem("unit-temperature") as "F" | "C") ?? "F";
    }
    return "F";
  });
  watch(temperatureUnit, (v) => {
    if (import.meta.client) {
      localStorage.setItem("unit-temperature", v);
    }
  });

  const windSpeedUnit = useState<"mph" | "km/h">("unit-wind-speed", () => {
    if (import.meta.client) {
      return (
        (localStorage.getItem("unit-wind-speed") as "mph" | "km/h") ?? "mph"
      );
    }
    return "mph";
  });
  watch(windSpeedUnit, (v) => {
    if (import.meta.client) {
      localStorage.setItem("unit-wind-speed", v);
    }
  });

  const pressureUnit = useState<"inHg" | "hPa">("unit-pressure", () => {
    if (import.meta.client) {
      return (
        (localStorage.getItem("unit-pressure") as "inHg" | "hPa") ?? "inHg"
      );
    }
    return "inHg";
  });
  watch(pressureUnit, (v) => {
    if (import.meta.client) {
      localStorage.setItem("unit-pressure", v);
    }
  });

  const precipUnit = useState<"in" | "mm">("unit-precipitation", () => {
    if (import.meta.client) {
      return (
        (localStorage.getItem("unit-precipitation") as "in" | "mm") ?? "in"
      );
    }
    return "in";
  });
  watch(precipUnit, (v) => {
    if (import.meta.client) {
      localStorage.setItem("unit-precipitation", v);
    }
  });

  const distanceUnit = useState<"mi" | "km">("unit-distance", () => {
    if (import.meta.client) {
      return (localStorage.getItem("unit-distance") as "mi" | "km") ?? "mi";
    }
    return "mi";
  });
  watch(distanceUnit, (v) => {
    if (import.meta.client) {
      localStorage.setItem("unit-distance", v);
    }
  });

  // Derive display strings for templates and API parameter values for useWeatherData
  const tempUnit = computed<string>(() =>
    temperatureUnit.value === "F" ? "°F" : "°C",
  );
  const speedUnit = computed<string>(() => windSpeedUnit.value);
  const temperatureApiUnit = computed<string>(() =>
    temperatureUnit.value === "F" ? "fahrenheit" : "celsius",
  );
  const windSpeedApiUnit = computed<string>(() =>
    windSpeedUnit.value === "mph" ? "mph" : "kmh",
  );
  const precipApiUnit = computed<string>(() =>
    precipUnit.value === "in" ? "inch" : "mm",
  );

  // Convert hPa to inHg, or return hPa value unchanged
  const formatPressure = (hPa: number): string =>
    pressureUnit.value === "inHg"
      ? `${(hPa * 0.02953).toFixed(2)} inHg`
      : `${Math.round(hPa)} hPa`;

  // Convert meters to miles or kilometers
  const formatVisibility = (meters: number): string =>
    distanceUnit.value === "mi"
      ? `${(meters / 1609.34).toFixed(0)} mi`
      : `${(meters / 1000).toFixed(0)} km`;

  return {
    // Raw preferences — used by the Settings UI
    temperatureUnit,
    windSpeedUnit,
    pressureUnit,
    precipUnit,
    distanceUnit,

    // Display strings — used in templates
    tempUnit, // computed: '°F' | '°C'
    speedUnit, // computed: 'mph' | 'km/h'

    // API parameter values — used by useWeatherData
    temperatureApiUnit, // computed: 'fahrenheit' | 'celsius'
    windSpeedApiUnit, // computed: 'mph' | 'kmh'  ← note: kmh not km/h for the API
    precipApiUnit, // computed: 'inch' | 'mm'

    formatPressure,
    formatVisibility,
  };
};
