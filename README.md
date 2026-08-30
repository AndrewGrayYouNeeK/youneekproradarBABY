# YouNeeK Pro Radar

A military-style NEXRAD radar and severe weather tracker — built for real storm chasers and weather enthusiasts.

## About

YouNeeK Pro Radar is a professional-grade weather radar application featuring live NEXRAD base reflectivity mosaics, NWS severe weather alert overlays, NOAA weather radio streaming, and an emergency shelter alert system. Designed to look like a tactical PPI scope with a dark, phosphor-green aesthetic.

## Features

- **Apple WeatherKit Forecasts** — Current conditions, next-hour precipitation, hourly, and 10-day outlook
- **Live NEXRAD Radar** — Iowa Mesonet base reflectivity mosaics, auto-refreshing every 5 minutes
- **NWS Alert Overlays** — Real-time GeoJSON polygons for:
  - 🔴 Tornado Warnings
  - 🟠 Severe Thunderstorm Warnings
  - 🔵 Flood Warnings
  - ❄️ Winter Storm Advisories
- **NOAA Weather Radio** — 130 stations nationwide with auto-select by GPS location
- **I'M SHELTERING Button** — One-tap emergency SMS to up to 5 contacts with GPS coordinates and Google Maps link
- **Dark Tactical UI** — PPI scope aesthetic, phosphor on black

## Running Locally

```bash
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radar.git
cd youneek-pro-radar
npm install
npm run dev
```

No API keys required for radar and NWS alerts. Apple WeatherKit forecasts need Developer credentials — see [WEATHERKIT.md](WEATHERKIT.md).

## Data Sources

- **Radar:** [Iowa Environmental Mesonet](https://mesonet.agron.iastate.edu) — NEXRAD mosaics
- **Forecasts:** [Apple WeatherKit](https://developer.apple.com/weatherkit/) — current, hourly, daily (optional)
- **Alerts:** [NWS Weather API](https://api.weather.gov) — Active polygon warnings
- **Radio:** NOAA Weather Radio station list (130 stations)

## Tech Stack

- React + Vite
- Leaflet.js for map rendering
- Iowa Mesonet XYZ tiles for radar
- NWS GeoJSON API for live alerts
- `sms:` URI scheme for emergency contacts

## Built By

Andrew Gray — YouNeeK
