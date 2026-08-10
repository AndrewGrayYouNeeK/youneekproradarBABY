// Fetches NOAA NHC active tropical cyclones via our API proxy.
export async function fetchActiveStorms() {
  const res = await fetch("/api/getActiveStorms");
  if (!res.ok) throw new Error(`Storms ${res.status}`);
  const data = await res.json();
  return data?.activeStorms || [];
}
