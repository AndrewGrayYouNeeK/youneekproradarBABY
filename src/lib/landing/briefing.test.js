import assert from "node:assert/strict";
import test from "node:test";
import {
  formatWind,
  normalizeAlert,
  outlineFeatures,
  parseGeocodeResults,
  radarFrameStamps,
  sortAlerts,
  upcomingDays,
  upcomingHours,
  zonesForOutlines,
} from "./briefing.js";

test("wind line includes direction and stronger gusts", () => {
  assert.equal(
    formatWind({ wind_speed_10m: 12.2, wind_gusts_10m: 28.4, wind_direction_10m: 0 }),
    "N 12 mph, gusts 28 mph"
  );
  assert.equal(formatWind({ wind_speed_10m: 8, wind_gusts_10m: 8, wind_direction_10m: 90 }), "E 8 mph");
  assert.equal(formatWind(null), "—");
});

test("forecast windows stay short", () => {
  const now = Date.parse("2026-10-21T18:00:00Z");
  const hourly = [
    { time: "2026-10-21T16:00:00Z" },
    { time: "2026-10-21T18:00:00Z" },
    { time: "2026-10-21T19:00:00Z" },
    { time: "2026-10-21T20:00:00Z" },
    { time: "2026-10-21T21:00:00Z" },
    { time: "2026-10-21T22:00:00Z" },
    { time: "2026-10-21T23:00:00Z" },
    { time: "2026-10-22T00:00:00Z" },
  ];
  assert.deepEqual(
    upcomingHours(hourly, 6, now).map((hour) => hour.time),
    hourly.slice(1, 7).map((hour) => hour.time)
  );
  assert.equal(upcomingDays([{ date: "a" }, { date: "b" }, { date: "c" }, { date: "d" }, { date: "e" }, { date: "f" }], 5).length, 5);
});

test("city search and NWS alerts keep the fields the landing shows", () => {
  const places = parseGeocodeResults({
    results: [
      { id: 1, name: "Charlotte", admin1: "North Carolina", country_code: "US", latitude: 35.22, longitude: -80.84 },
      { id: 2, name: "Nope", latitude: "x", longitude: 1 },
    ],
  });
  assert.equal(places.length, 1);
  assert.equal(places[0].label, "Charlotte, North Carolina, US");

  const alert = normalizeAlert({
    id: "alert-1",
    geometry: { type: "Polygon", coordinates: [] },
    properties: {
      event: "Flash Flood Warning",
      headline: "Flash Flood Warning until 5:30 PM",
      severity: "Severe",
      ends: "2026-10-22T00:30:00Z",
      instruction: "Move to higher ground.   Avoid flooded roads.",
      web: "https://alerts.weather.gov/example",
    },
  });
  assert.equal(alert.headline, "Flash Flood Warning until 5:30 PM");
  assert.equal(alert.instruction, "Move to higher ground. Avoid flooded roads.");
  assert.equal(alert.url, "https://alerts.weather.gov/example");
  assert.equal(alert.geometry.type, "Polygon");
  assert.equal(sortAlerts([{ severity: "Minor" }, { severity: "Extreme" }])[0].severity, "Extreme");
});

test("zone outlines use the visitor's zone when the alert has no polygon", () => {
  const county = "https://api.weather.gov/zones/county/AZC005";
  const other = "https://api.weather.gov/zones/county/AZC017";
  const alerts = [
    normalizeAlert({
      id: "watch",
      geometry: null,
      properties: {
        event: "Tornado Watch",
        severity: "Extreme",
        affectedZones: [county, other, "https://example.com/nope"],
        description: "THE NATIONAL WEATHER SERVICE HAS ISSUED TORNADO WATCH 688.",
      },
    }),
    normalizeAlert({
      id: "warn",
      geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
      properties: { event: "Flash Flood Warning", severity: "Severe", instruction: "Move to higher ground." },
    }),
  ];
  assert.equal(alerts[0].instruction, "THE NATIONAL WEATHER SERVICE HAS ISSUED TORNADO WATCH 688.");
  assert.deepEqual(alerts[0].affectedZones, [county, other]);
  assert.deepEqual(zonesForOutlines(alerts, []), []);
  assert.deepEqual(zonesForOutlines(alerts, [county]), [county]);
  const features = outlineFeatures(alerts, { [county]: { type: "Polygon", coordinates: [] } });
  assert.equal(features.length, 2);
  assert.equal(features[0].event, "Tornado Watch");
  assert.equal(features[1].event, "Flash Flood Warning");
});

test("radar loop is a short precipitation sequence", () => {
  const frames = radarFrameStamps(new Date("2026-10-21T21:37:00Z"), 5);
  assert.equal(frames.length, 5);
  assert.equal(frames[4].stamp, "202610212125");
  assert.equal(frames[3].stamp, "202610212120");
});
