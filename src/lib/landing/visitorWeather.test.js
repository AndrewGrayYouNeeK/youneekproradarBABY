import assert from "node:assert/strict";
import test from "node:test";
import { RADAR_APP_URL, RADAR_SAFETY_URL } from "./radarApp.js";
import {
  daylightFromCurrent,
  fallbackSky,
  parseIpLocation,
  pickVisitorConditions,
  skyFromCurrent,
} from "./visitorWeather.js";

test("Open Radar points at the live YNK222 radar app", () => {
  assert.equal(RADAR_APP_URL, "https://youneek-pro-radarynk222.youneekartifacts.workers.dev/Radar");
  assert.equal(RADAR_SAFETY_URL, "https://youneek-pro-radarynk222.youneekartifacts.workers.dev/Contacts");
});

test("IP geolocation accepts geojs and ipwho payloads", () => {
  const geojs = parseIpLocation({
    city: "Boardman",
    region: "Oregon",
    latitude: "45.8401",
    longitude: "-119.705",
  });
  assert.equal(geojs.label, "Boardman, Oregon");
  assert.equal(geojs.latitude, 45.8401);
  assert.equal(geojs.source, "ip");

  const ipwho = parseIpLocation({ city: "Denver", region_code: "CO", latitude: 39.74, longitude: -104.99 });
  assert.equal(ipwho.label, "Denver, CO");
  assert.equal(parseIpLocation({ latitude: "nope", longitude: 1 }), null);
  assert.equal(parseIpLocation({ latitude: 120, longitude: 10 }), null);
});

test("visitor weather prefers YNK222 and falls back to Open-Meteo", () => {
  const ynk = { temperature_2m: 70, weather_code: 0 };
  const meteo = { temperature_2m: 61, weather_code: 63 };
  assert.equal(pickVisitorConditions(ynk, meteo).source, "ynk222");
  assert.equal(pickVisitorConditions(null, meteo).source, "open-meteo");
  assert.equal(pickVisitorConditions({ temperature_2m: "warm" }, meteo).source, "open-meteo");
  assert.equal(pickVisitorConditions(null, null), null);
});

test("sky follows the reported condition, then the time of day", () => {
  const rain = skyFromCurrent({ temperature_2m: 55, weather_code: 63, daylight: true });
  assert.equal(rain.name, "rain");

  const storm = skyFromCurrent({
    temperature_2m: 68,
    weather_code: 95,
    condition_code: "Thunderstorms",
    daylight: true,
  });
  assert.equal(storm.name, "storm");

  const night = skyFromCurrent({ temperature_2m: 40, weather_code: 0, condition_code: "Clear", daylight: false });
  assert.equal(night.name, "clear-night");

  const snow = skyFromCurrent({ temperature_2m: 20, weather_code: 73, is_day: 1 });
  assert.equal(snow.name, "snow");
  assert.equal(daylightFromCurrent({ is_day: 0 }), false);

  const morning = fallbackSky(new Date("2026-06-01T15:00:00"));
  const late = fallbackSky(new Date("2026-06-01T23:30:00"));
  assert.equal(morning.name, "clear");
  assert.equal(late.name, "clear-night");
  assert.equal(skyFromCurrent(null, new Date("2026-01-01T03:00:00")).name, "clear-night");
});
