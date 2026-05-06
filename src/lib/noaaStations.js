// NOAA Weather Radio All Hazards (NWR) — curated public stream list
// Sources: National Weather Service public station info + open public streams
// These are commonly-mirrored public NWR audio feeds.

export const NOAA_STATIONS = [
  // Kentucky / Tennessee region (default for Columbia, KY)
  { id: "KIH59", call: "KIH59", city: "Louisville", state: "KY", freq: "162.475", lat: 38.2527, lon: -85.7585, stream: "https://broadcastify.cdnstream1.com/2334" },
  { id: "WXM98", call: "WXM98", city: "Bowling Green", state: "KY", freq: "162.500", lat: 36.9685, lon: -86.4808, stream: "https://broadcastify.cdnstream1.com/2611" },
  { id: "WXL58", call: "WXL58", city: "Lexington", state: "KY", freq: "162.475", lat: 38.0406, lon: -84.5037, stream: "https://broadcastify.cdnstream1.com/4632" },
  { id: "WXJ73", call: "WXJ73", city: "Nashville", state: "TN", freq: "162.550", lat: 36.1627, lon: -86.7816, stream: "https://broadcastify.cdnstream1.com/3145" },
  { id: "KIH26", call: "KIH26", city: "Knoxville", state: "TN", freq: "162.475", lat: 35.9606, lon: -83.9207, stream: "https://broadcastify.cdnstream1.com/3820" },
  { id: "WXJ42", call: "WXJ42", city: "Memphis", state: "TN", freq: "162.475", lat: 35.1495, lon: -90.0490, stream: "https://broadcastify.cdnstream1.com/3641" },

  // Major metros across US
  { id: "KWO39", call: "KWO39", city: "New York", state: "NY", freq: "162.550", lat: 40.7128, lon: -74.0060, stream: "https://broadcastify.cdnstream1.com/2575" },
  { id: "KWO35", call: "KWO35", city: "Chicago", state: "IL", freq: "162.550", lat: 41.8781, lon: -87.6298, stream: "https://broadcastify.cdnstream1.com/3137" },
  { id: "KEC61", call: "KEC61", city: "Los Angeles", state: "CA", freq: "162.550", lat: 34.0522, lon: -118.2437, stream: "https://broadcastify.cdnstream1.com/2554" },
  { id: "WXK28", call: "WXK28", city: "Atlanta", state: "GA", freq: "162.550", lat: 33.7490, lon: -84.3880, stream: "https://broadcastify.cdnstream1.com/2606" },
  { id: "WXK69", call: "WXK69", city: "Dallas", state: "TX", freq: "162.400", lat: 32.7767, lon: -96.7970, stream: "https://broadcastify.cdnstream1.com/3631" },
  { id: "WXK40", call: "WXK40", city: "Houston", state: "TX", freq: "162.550", lat: 29.7604, lon: -95.3698, stream: "https://broadcastify.cdnstream1.com/2599" },
  { id: "KIH28", call: "KIH28", city: "Miami", state: "FL", freq: "162.550", lat: 25.7617, lon: -80.1918, stream: "https://broadcastify.cdnstream1.com/2604" },
  { id: "WXM62", call: "WXM62", city: "Tampa", state: "FL", freq: "162.550", lat: 27.9506, lon: -82.4572, stream: "https://broadcastify.cdnstream1.com/3133" },
  { id: "KEC55", call: "KEC55", city: "Seattle", state: "WA", freq: "162.550", lat: 47.6062, lon: -122.3321, stream: "https://broadcastify.cdnstream1.com/2600" },
  { id: "KEC42", call: "KEC42", city: "Denver", state: "CO", freq: "162.550", lat: 39.7392, lon: -104.9903, stream: "https://broadcastify.cdnstream1.com/2613" },
  { id: "WXJ56", call: "WXJ56", city: "Boston", state: "MA", freq: "162.475", lat: 42.3601, lon: -71.0589, stream: "https://broadcastify.cdnstream1.com/2580" },
  { id: "KHB36", call: "KHB36", city: "Washington", state: "DC", freq: "162.550", lat: 38.9072, lon: -77.0369, stream: "https://broadcastify.cdnstream1.com/2581" },
  { id: "WXL52", call: "WXL52", city: "St. Louis", state: "MO", freq: "162.550", lat: 38.6270, lon: -90.1994, stream: "https://broadcastify.cdnstream1.com/3150" },
  { id: "KIG77", call: "KIG77", city: "Oklahoma City", state: "OK", freq: "162.400", lat: 35.4676, lon: -97.5164, stream: "https://broadcastify.cdnstream1.com/2618" },
  { id: "KEC57", call: "KEC57", city: "Phoenix", state: "AZ", freq: "162.550", lat: 33.4484, lon: -112.0740, stream: "https://broadcastify.cdnstream1.com/2603" },
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