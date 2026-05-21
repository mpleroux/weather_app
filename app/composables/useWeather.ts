import type { Ref } from "vue";

// Raw Open-Meteo API response shape
interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    relative_humidity_2m: number;
    precipitation: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
}

// Clean shape exposed to components
export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
}

export interface DailyWeather {
  dates: string[];
  weatherCodes: number[];
  maxTemps: number[];
  minTemps: number[];
  precipitation: number[];
  maxWindSpeed: number[];
}

export interface HourlyWeather {
  times: string[];
  temperatures: number[];
  weatherCodes: number[];
  precipitationProbability: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyWeather;
  hourly: HourlyWeather;
}

export const useWeather = (lat: Ref<number>, lon: Ref<number>) => {
  const { units } = useUnits();

  const url = computed(() => {
    const temperatureUnit =
      units.value === "imperial" ? "fahrenheit" : "celsius";
    const windSpeedUnit = units.value === "imperial" ? "mph" : "km/h";

    return (
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat.value}&longitude=${lon.value}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}` +
      `&timezone=auto&forecast_days=7`
    );
  });

  const { data, pending, error, refresh } = useFetch<OpenMeteoResponse>(url);

  const weather = computed<WeatherData | null>(() => {
    if (!data.value) return null;

    return {
      current: {
        time: data.value.current.time,
        temperature: data.value.current.temperature_2m,
        apparentTemperature: data.value.current.apparent_temperature,
        weatherCode: data.value.current.weather_code,
        windSpeed: data.value.current.wind_speed_10m,
        windDirection: data.value.current.wind_direction_10m,
        humidity: data.value.current.relative_humidity_2m,
        precipitation: data.value.current.precipitation,
      },
      daily: {
        dates: data.value.daily.time,
        weatherCodes: data.value.daily.weather_code,
        maxTemps: data.value.daily.temperature_2m_max,
        minTemps: data.value.daily.temperature_2m_min,
        precipitation: data.value.daily.precipitation_sum,
        maxWindSpeed: data.value.daily.wind_speed_10m_max,
      },
      hourly: {
        times: data.value.hourly.time,
        temperatures: data.value.hourly.temperature_2m,
        weatherCodes: data.value.hourly.weather_code,
        precipitationProbability: data.value.hourly.precipitation_probability,
      },
    };
  });

  return { weather, pending, error, refresh };
};
