import { formatConditionCode } from "./conditions.js";
import { formatMoonPhase } from "./lifestyle.js";

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

function popPercent(value) {
  if (value == null) return 0;
  return Math.round(value <= 1 ? value * 100 : value);
}

function cToF(c) {
  if (!Number.isFinite(Number(c))) return null;
  return (Number(c) * 9) / 5 + 32;
}

function kmhToMph(speed) {
  if (!Number.isFinite(Number(speed))) return null;
  return Number(speed) * 0.621371;
}

function mmToIn(mm) {
  if (!Number.isFinite(Number(mm))) return null;
  return Number(mm) / 25.4;
}

function metersToMiles(meters) {
  if (!Number.isFinite(Number(meters))) return null;
  return Number(meters) / 1609.344;
}

function pct(value) {
  if (!Number.isFinite(Number(value))) return null;
  const n = Number(value);
  return Math.round(n <= 1 ? n * 100 : n);
}

function roundTemp(c) {
  const f = cToF(c);
  return f == null ? null : Math.round(f);
}

export function adaptWeatherKitCurrent(data) {
  const current = data?.currentWeather;
  const today = data?.forecastDaily?.days?.[0];

  return {
    current: {
      temperature_2m: cToF(current?.temperature),
      apparent_temperature: cToF(current?.temperatureApparent),
      dew_point: cToF(current?.temperatureDewPoint),
      relative_humidity_2m: pct(current?.humidity),
      wind_speed_10m: kmhToMph(current?.windSpeed),
      wind_direction_10m: current?.windDirection,
      wind_gusts_10m: kmhToMph(current?.windGust),
      weather_code: conditionToWmo(current?.conditionCode),
      condition_label: formatConditionCode(current?.conditionCode),
      pressure_msl: current?.pressure,
      pressure_trend: current?.pressureTrend,
      visibility: current?.visibility,
      visibility_mi: metersToMiles(current?.visibility),
      uv_index: current?.uvIndex,
      cloud_cover: pct(current?.cloudCover),
      cloud_cover_low: pct(current?.cloudCoverLowAltPct),
      cloud_cover_mid: pct(current?.cloudCoverMidAltPct),
      cloud_cover_high: pct(current?.cloudCoverHighAltPct),
      precipitation_intensity: mmToIn(current?.precipitationIntensity),
      precip_type: current?.precipitationType || today?.precipitationType,
      daylight: current?.daylight,
      as_of: current?.asOf,
    },
    daily: {
      temperature_2m_max: [cToF(today?.temperatureMax)],
      temperature_2m_min: [cToF(today?.temperatureMin)],
      sunrise: [today?.sunrise],
      sunset: [today?.sunset],
    },
  };
}

function adaptHour(hour) {
  return {
    time: hour.forecastStart,
    temperature: roundTemp(hour.temperature),
    apparent: roundTemp(hour.temperatureApparent),
    dewPoint: cToF(hour.temperatureDewPoint),
    pop: popPercent(hour.precipitationChance),
    label: formatConditionCode(hour.conditionCode),
    weather_code: conditionToWmo(hour.conditionCode),
    uv: hour.uvIndex,
    wind: kmhToMph(hour.windSpeed),
    windDir: hour.windDirection,
    gusts: kmhToMph(hour.windGust),
    precip: mmToIn(hour.precipitationAmount),
    precipIntensity: mmToIn(hour.precipitationIntensity),
    precipType: hour.precipitationType,
    snow: mmToIn(hour.snowfallAmount),
    snowIntensity: mmToIn(hour.snowfallIntensity),
    humidity: pct(hour.humidity),
    pressure: hour.pressure,
    pressureTrend: hour.pressureTrend,
    visibility: metersToMiles(hour.visibility),
    cloudCover: pct(hour.cloudCover),
    daylight: hour.daylight,
  };
}

export function adaptWeatherKitHourly(data) {
  return (data?.forecastHourly?.hours || []).map(adaptHour);
}

function adaptDayPart(part) {
  if (!part) return null;
  return {
    start: part.forecastStart,
    end: part.forecastEnd,
    conditionCode: part.conditionCode,
    label: formatConditionCode(part.conditionCode),
    weather_code: conditionToWmo(part.conditionCode),
    high: roundTemp(part.temperatureMax),
    low: roundTemp(part.temperatureMin),
    pop: popPercent(part.precipitationChance),
    precip: mmToIn(part.precipitationAmount),
    snow: mmToIn(part.snowfallAmount),
    precipType: part.precipitationType,
    humidity: pct(part.humidity),
    cloudCover: pct(part.cloudCover),
    wind: kmhToMph(part.windSpeed),
    windMax: kmhToMph(part.windSpeedMax),
    gusts: kmhToMph(part.windGustSpeedMax),
    windDir: part.windDirection,
  };
}

export function adaptWeatherKitDaily(data) {
  return (data?.forecastDaily?.days || []).map((day) => ({
    date: day.forecastStart,
    end: day.forecastEnd,
    high: roundTemp(day.temperatureMax),
    low: roundTemp(day.temperatureMin),
    pop: popPercent(day.precipitationChance),
    label: formatConditionCode(day.conditionCode),
    weather_code: conditionToWmo(day.conditionCode),
    precip: mmToIn(day.precipitationAmount),
    precipType: day.precipitationType,
    snow: mmToIn(day.snowfallAmount),
    uv: day.maxUvIndex,
    sunrise: day.sunrise,
    sunset: day.sunset,
    moonPhase: day.moonPhase,
    moonrise: day.moonrise,
    moonset: day.moonset,
    windAvg: kmhToMph(day.windSpeedAvg),
    windMax: kmhToMph(day.windSpeedMax),
    gusts: kmhToMph(day.windGustSpeedMax),
    daytime: adaptDayPart(day.daytimeForecast),
    overnight: adaptDayPart(day.overnightForecast),
    restOfDay: adaptDayPart(day.restOfDayForecast),
  }));
}

export function adaptWeatherKitDayParts(data) {
  const today = data?.forecastDaily?.days?.[0];
  if (!today) return [];
  return [
    today.restOfDayForecast && { id: "rest", title: "Rest of today", ...adaptDayPart(today.restOfDayForecast) },
    today.daytimeForecast && { id: "day", title: "Today", ...adaptDayPart(today.daytimeForecast) },
    today.overnightForecast && { id: "night", title: "Tonight", ...adaptDayPart(today.overnightForecast) },
  ].filter(Boolean);
}

export function adaptWeatherKitAstronomy(data) {
  const today = data?.forecastDaily?.days?.[0];
  if (!today) return null;
  return {
    sunrise: today.sunrise,
    sunset: today.sunset,
    sunriseCivil: today.sunriseCivil,
    sunriseNautical: today.sunriseNautical,
    sunriseAstronomical: today.sunriseAstronomical,
    sunsetCivil: today.sunsetCivil,
    sunsetNautical: today.sunsetNautical,
    sunsetAstronomical: today.sunsetAstronomical,
    solarNoon: today.solarNoon,
    solarMidnight: today.solarMidnight,
    moonPhase: today.moonPhase,
    moonPhaseLabel: formatMoonPhase(today.moonPhase),
    moonrise: today.moonrise,
    moonset: today.moonset,
  };
}

export function adaptWeatherKitNextHour(data) {
  return (data?.forecastNextHour?.minutes || []).map((minute) => ({
    time: minute.startTime,
    chance: popPercent(minute.precipitationChance),
    intensity: mmToIn(minute.precipitationIntensity) ?? 0,
  }));
}

export function adaptWeatherKitMinuteSummary(data) {
  return (data?.forecastNextHour?.summary || []).map((item) => ({
    time: item.startTime,
    condition: item.condition,
    chance: popPercent(item.precipitationChance),
    intensity: mmToIn(item.precipitationIntensity) ?? 0,
  }));
}

export function adaptWeatherKitAlerts(data) {
  const collection = data?.weatherAlerts;
  const alerts = collection?.alerts || collection || [];
  if (!Array.isArray(alerts)) return [];

  return alerts.map((alert) => ({
    id: alert.id || alert.detailsUrl || `${alert.name}-${alert.issuedTime}`,
    name: alert.name || alert.event || "Weather alert",
    event: alert.event || "",
    description: alert.description || alert.summary || "",
    source: alert.source || "Apple Weather",
    severity: alert.severity || alert.priority || "",
    urgency: alert.urgency || "",
    certainty: alert.certainty || "",
    importance: alert.importance || "",
    area: alert.areaId || alert.area || "",
    issued: alert.issuedTime || alert.effectiveTime,
    expires: alert.expireTime || alert.expiresTime,
    url: alert.detailsUrl,
  }));
}

export function adaptWeatherKitMetadata(data) {
  const meta =
    data?.currentWeather?.metadata ||
    data?.forecastHourly?.metadata ||
    data?.forecastDaily?.metadata ||
    {};
  return {
    attributionURL: meta.attributionURL || "https://developer.apple.com/weatherkit/data-source-attribution/",
    expireTime: meta.expireTime,
    readTime: meta.readTime,
    reportedTime: meta.reportedTime,
    latitude: meta.latitude,
    longitude: meta.longitude,
    attribution: data?.attribution || null,
    alertDetailsUrl: data?.weatherAlerts?.detailsUrl || null,
  };
}

export function splitWeatherKitHourly(hours = []) {
  const now = Date.now();
  const recentCutoff = now - 24 * 60 * 60 * 1000;
  const recentHours = [];
  const upcoming = [];

  hours.forEach((hour) => {
    const time = new Date(hour.time).getTime();
    if (!Number.isFinite(time)) return;
    if (time <= now && time >= recentCutoff) recentHours.push(hour);
    if (time >= now - 30 * 60 * 1000) upcoming.push(hour);
  });

  return {
    recentHours,
    hourly: upcoming.slice(0, 168),
  };
}

export function adaptWeatherKitComparison(hours = [], currentTemp) {
  const target = Date.now() - 24 * 60 * 60 * 1000;
  let best = null;
  let bestDiff = Infinity;

  hours.forEach((hour) => {
    const time = new Date(hour.time).getTime();
    if (!Number.isFinite(time)) return;
    const diff = Math.abs(time - target);
    if (diff < bestDiff) {
      best = hour;
      bestDiff = diff;
    }
  });

  if (!best || bestDiff > 90 * 60 * 1000) return null;

  const current = Number.isFinite(Number(currentTemp)) ? Math.round(Number(currentTemp)) : null;
  return {
    time: best.time,
    temperature: best.temperature,
    label: best.label,
    weather_code: best.weather_code,
    delta: current != null && Number.isFinite(best.temperature) ? current - best.temperature : null,
  };
}
