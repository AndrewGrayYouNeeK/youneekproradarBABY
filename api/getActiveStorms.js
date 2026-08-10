// Proxies NOAA NHC active tropical cyclones (avoids browser CORS restrictions).
export default async function handler(_req, res) {
  try {
    const response = await fetch("https://www.nhc.noaa.gov/CurrentStorms.json", {
      headers: { "User-Agent": "YouNeeKProRadar/1.0" },
    });
    if (!response.ok) {
      return res.status(200).json({ activeStorms: [], error: `NHC ${response.status}` });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ activeStorms: [], error: err.message });
  }
}
