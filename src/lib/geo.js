const EARTH_KM = 6371;

export function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return EARTH_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function kmToMiles(km) {
  return km * 0.621371;
}

export function formatDistance(km, unit = "mi") {
  if (!Number.isFinite(km)) return "—";
  if (unit === "km") {
    return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
  }
  const miles = kmToMiles(km);
  return miles >= 10 ? `${Math.round(miles)} mi` : `${miles.toFixed(1)} mi`;
}

export function kmToUserDistance(km, unit = "mi") {
  return formatDistance(km, unit);
}
