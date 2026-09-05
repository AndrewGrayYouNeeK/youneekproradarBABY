export async function fetchEnvironment({ latitude, longitude }) {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "us_aqi,pm2_5,uv_index,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen"
  );
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Air quality unavailable");
  const payload = await response.json();
  const current = payload.current || {};
  const pollenEntries = [
    ["Ragweed", current.ragweed_pollen],
    ["Grass", current.grass_pollen],
    ["Birch", current.birch_pollen],
    ["Mugwort", current.mugwort_pollen],
    ["Olive", current.olive_pollen],
    ["Alder", current.alder_pollen],
  ]
    .map(([name, value]) => [name, Number(value)])
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b[1] - a[1]);

  return {
    aqi: current.us_aqi ?? null,
    pm25: current.pm2_5 ?? null,
    uv: current.uv_index ?? null,
    pollen: pollenEntries.length ? pollenEntries[0][1] : null,
    pollenTriggers: pollenEntries.slice(0, 3).map(([name]) => name),
  };
}
