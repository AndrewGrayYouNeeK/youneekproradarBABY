// NOAA Weather Radio All Hazards (NWR) — public stream directory.
// NOTE: NWR does not have an official public audio API. The streams below come
// from Broadcastify's public listen feeds (free, no auth required for the
// listed endpoints). If a feed is offline, the user is shown a clear error
// and can pick another or open the source page.

export const NOAA_STATIONS = [
  // Kentucky / Tennessee region
  { id: "32779", call: "KIH59", city: "Louisville", state: "KY", freq: "162.475", lat: 38.2527, lon: -85.7585,
    stream: "https://broadcastify.cdnstream1.com/32779", source: "https://www.broadcastify.com/listen/feed/32779" },
  { id: "29980", call: "WXM98", city: "Bowling Green", state: "KY", freq: "162.500", lat: 36.9685, lon: -86.4808,
    stream: "https://broadcastify.cdnstream1.com/29980", source: "https://www.broadcastify.com/listen/feed/29980" },
  { id: "30420", call: "WXJ73", city: "Nashville", state: "TN", freq: "162.550", lat: 36.1627, lon: -86.7816,
    stream: "https://broadcastify.cdnstream1.com/30420", source: "https://www.broadcastify.com/listen/feed/30420" },
  { id: "16823", call: "KIH26", city: "Knoxville", state: "TN", freq: "162.475", lat: 35.9606, lon: -83.9207,
    stream: "https://broadcastify.cdnstream1.com/16823", source: "https://www.broadcastify.com/listen/feed/16823" },
  { id: "30525", call: "WXJ42", city: "Memphis", state: "TN", freq: "162.475", lat: 35.1495, lon: -90.0490,
    stream: "https://broadcastify.cdnstream1.com/30525", source: "https://www.broadcastify.com/listen/feed/30525" },

  // Major US metros
  { id: "21684", call: "KWO35", city: "Chicago", state: "IL", freq: "162.550", lat: 41.8781, lon: -87.6298,
    stream: "https://broadcastify.cdnstream1.com/21684", source: "https://www.broadcastify.com/listen/feed/21684" },
  { id: "27693", call: "WXK28", city: "Atlanta", state: "GA", freq: "162.550", lat: 33.7490, lon: -84.3880,
    stream: "https://broadcastify.cdnstream1.com/27693", source: "https://www.broadcastify.com/listen/feed/27693" },
  { id: "13707", call: "WXK69", city: "Dallas-Fort Worth", state: "TX", freq: "162.400", lat: 32.7767, lon: -96.7970,
    stream: "https://broadcastify.cdnstream1.com/13707", source: "https://www.broadcastify.com/listen/feed/13707" },
  { id: "8836", call: "WXK40", city: "Houston", state: "TX", freq: "162.550", lat: 29.7604, lon: -95.3698,
    stream: "https://broadcastify.cdnstream1.com/8836", source: "https://www.broadcastify.com/listen/feed/8836" },
  { id: "30419", call: "KIH28", city: "Miami", state: "FL", freq: "162.550", lat: 25.7617, lon: -80.1918,
    stream: "https://broadcastify.cdnstream1.com/30419", source: "https://www.broadcastify.com/listen/feed/30419" },
  { id: "9119", call: "KEC55", city: "Seattle", state: "WA", freq: "162.550", lat: 47.6062, lon: -122.3321,
    stream: "https://broadcastify.cdnstream1.com/9119", source: "https://www.broadcastify.com/listen/feed/9119" },
  { id: "8334", call: "KEC42", city: "Denver", state: "CO", freq: "162.550", lat: 39.7392, lon: -104.9903,
    stream: "https://broadcastify.cdnstream1.com/8334", source: "https://www.broadcastify.com/listen/feed/8334" },
  { id: "17751", call: "WXL52", city: "St. Louis", state: "MO", freq: "162.550", lat: 38.6270, lon: -90.1994,
    stream: "https://broadcastify.cdnstream1.com/17751", source: "https://www.broadcastify.com/listen/feed/17751" },
  { id: "27695", call: "KIG77", city: "Oklahoma City", state: "OK", freq: "162.400", lat: 35.4676, lon: -97.5164,
    stream: "https://broadcastify.cdnstream1.com/27695", source: "https://www.broadcastify.com/listen/feed/27695" },
  { id: "8161", call: "KEC57", city: "Phoenix", state: "AZ", freq: "162.550", lat: 33.4484, lon: -112.0740,
    stream: "https://broadcastify.cdnstream1.com/8161", source: "https://www.broadcastify.com/listen/feed/8161" },
];

// Haversine — find nearest station
export function nearestStation(lat, lon) {
  const R = 3959; // mi
  let best = null;
  let bestDist = Infinity;
  for (const s of NOAA_STATIONS) {
    const dLat = ((s.lat - lat) * Math.PI) / 180;
    const dLon = ((s.lon - lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((s.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return { station: best, distance: bestDist };
}