const CONDITION_TO_WMO = {
  Clear: 0,
  MostlyClear: 1,
  PartlyCloudy: 2,
  MostlyCloudy: 2,
  Cloudy: 3,
  Fog: 45,
  Haze: 45,
  Smoky: 45,
  Breezy: 2,
  Windy: 2,
  Frigid: 71,
  Hot: 0,
  Hail: 96,
  Thunderstorms: 95,
  IsolatedThunderstorms: 95,
  ScatteredThunderstorms: 95,
  StrongStorms: 99,
  Drizzle: 53,
  HeavyRain: 65,
  Rain: 63,
  Showers: 80,
  Flurries: 71,
  HeavySnow: 75,
  Snow: 73,
  Blizzard: 75,
  BlowingSnow: 75,
  FreezingDrizzle: 56,
  FreezingRain: 66,
  Sleet: 77,
  WintryMix: 77,
  Hurricane: 95,
  TropicalStorm: 95,
};

function conditionToWmo(code) {
  return CONDITION_TO_WMO[code] ?? 0;
}

function formatConditionCode(code) {
  if (!code) return "—";
  return code.replace(/([A-Z])/g, " $1").trim();
}

function popPercent(value) {
  if (value == null) return 0;
  return Math.round(value <= 1 ? value * 100 : value);
}

export function adaptWeatherKitCurrent(data) {
  const current = data?.currentWeather;
  const today = data?.forecastDaily?.days?.[0];

  return {
    current: {
      temperature_2m: current?.temperature,
      apparent_temperature: current?.temperatureApparent,
      relative_humidity_2m: (current?.humidity ?? 0) * 100,
      wind_speed_10m: current?.windSpeed,
      wind_direction_10m: current?.windDirection,
      wind_gusts_10m: current?.windGust,
      weather_code: conditionToWmo(current?.conditionCode),
      pressure_msl: current?.pressure,
      visibility: current?.visibility,
      uv_index: current?.uvIndex,
    },
    daily: {
      temperature_2m_max: [today?.temperatureMax],
      temperature_2m_min: [today?.temperatureMin],
      sunrise: [today?.sunrise],
      sunset: [today?.sunset],
    },
    _source: "weatherkit",
  };
}

export function adaptWeatherKitHourly(data) {
  const hours = data?.forecastHourly?.hours || [];

  return {
    properties: {
      periods: hours.map((hour) => ({
        startTime: hour.forecastStart,
        temperature: Math.round(hour.temperature ?? 0),
        probabilityOfPrecipitation: { value: popPercent(hour.precipitationChance) },
        shortForecast: formatConditionCode(hour.conditionCode),
      })),
    },
    _source: "weatherkit",
  };
}

export function adaptWeatherKitDaily(data) {
  const days = data?.forecastDaily?.days || [];
  const periods = [];

  days.forEach((day) => {
    periods.push({
      isDaytime: true,
      startTime: day.forecastStart,
      temperature: Math.round(day.temperatureMax ?? 0),
      probabilityOfPrecipitation: { value: popPercent(day.precipitationChance) },
      shortForecast: formatConditionCode(day.conditionCode),
    });
    periods.push({
      isDaytime: false,
      startTime: day.forecastEnd || day.forecastStart,
      temperature: Math.round(day.temperatureMin ?? 0),
      probabilityOfPrecipitation: { value: popPercent(day.precipitationChance) },
      shortForecast: formatConditionCode(day.conditionCode),
    });
  });

  return {
    properties: { periods },
    _source: "weatherkit",
  };
}
