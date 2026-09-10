const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const CURRENT =
  "us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index,dust,aerosol_optical_depth,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen";

export async function fetchAirQuality(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT,
    hourly: "us_aqi,uv_index,pm2_5,grass_pollen,ragweed_pollen",
    forecast_days: "2",
    domains: "auto",
    timezone: "auto",
  });

  const response = await fetch(`${AIR_URL}?${params.toString()}`);
  if (!response.ok) throw new Error("Air quality request failed");
  return response.json();
}

export function adaptAirQuality(data) {
  const current = data?.current || {};
  const pollen = {
    alder: current.alder_pollen,
    birch: current.birch_pollen,
    grass: current.grass_pollen,
    mugwort: current.mugwort_pollen,
    olive: current.olive_pollen,
    ragweed: current.ragweed_pollen,
  };
  const pollenValues = Object.values(pollen).filter((value) => Number.isFinite(value));
  const pollenMax = pollenValues.length ? Math.max(...pollenValues) : null;

  return {
    usAqi: current.us_aqi,
    euAqi: current.european_aqi,
    pm25: current.pm2_5,
    pm10: current.pm10,
    ozone: current.ozone,
    no2: current.nitrogen_dioxide,
    so2: current.sulphur_dioxide,
    co: current.carbon_monoxide,
    dust: current.dust,
    aod: current.aerosol_optical_depth,
    uv: current.uv_index,
    pollen,
    pollenMax,
    asOf: current.time,
  };
}
