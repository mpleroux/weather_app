export const useWmoCode = () => {
  // Helper functions for formatting and display
  const weatherDescription = (code: number): string => {
    const descriptions: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      77: "Snow grains",
      80: "Light showers",
      81: "Showers",
      82: "Heavy showers",
      85: "Light snow showers",
      86: "Snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };
    return descriptions[code] ?? "Unknown";
  };

  // Map WMO weather codes to Meteocons icon names
  const weatherIcon = (code: number, isDay: number): string => {
    const icons: Record<number, string> = {
      0: isDay ? "clear-day" : "clear-night",
      1: isDay ? "mostly-clear-day" : "mostly-clear-night",
      2: isDay ? "partly-cloudy-day" : "partly-cloudy-night",
      3: isDay ? "overcast" : "overcast-night",
      45: isDay ? "fog" : "fog-night",
      48: isDay ? "fog" : "fog-night",
      51: "drizzle",
      53: "drizzle",
      55: "drizzle",
      61: "rain",
      63: "rain",
      65: "rain",
      71: "snow",
      73: "snow",
      75: "snow",
      77: "snow",
      80: "drizzle",
      81: "rain",
      82: "rain",
      85: "snow",
      86: "snow",
      95: isDay ? "thunderstorms" : "thunderstorms-night",
      96: isDay ? "thunderstorms-hail" : "thunderstorms-night-hail",
      99: isDay ? "thunderstorms-extreme" : "thunderstorms-extreme-night",
    };
    return icons[code] ?? "not-available";
  };

  return { weatherDescription, weatherIcon };
};
