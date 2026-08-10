# YouNeeK Pro Radar

A military-style NEXRAD radar and severe weather tracker — built for real storm chasers and weather enthusiasts.

## About

YouNeeK Pro Radar is a professional-grade weather radar application featuring live NEXRAD base reflectivity mosaics, NWS severe weather alert overlays, NOAA weather radio streaming, and an emergency shelter alert system. Designed to look like a tactical PPI scope with a dark, phosphor-green aesthetic.

## Features

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

No API keys required for radar or alerts — uses Iowa Mesonet public tiles and NWS public GeoJSON endpoints.

### Apple WeatherKit (forecasts)

Forecasts use [Apple WeatherKit](https://developer.apple.com/weatherkit/) via your Apple Developer Program membership. Set up once:

1. In [Apple Developer → Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources):
   - Create a **Services ID** (e.g. `com.youneek.proradar.weather`)
   - Create a **Key** with WeatherKit enabled and download the `.p8` file
2. Copy `.env.example` to `.env` and fill in:
   - `WEATHERKIT_TEAM_ID` — your 10-character Team ID
   - `WEATHERKIT_KEY_ID` — the key ID from step 1
   - `WEATHERKIT_SERVICE_ID` — the Services ID you registered
   - `WEATHERKIT_PRIVATE_KEY` — contents of the `.p8` file (keep newlines as `\n`)
3. On Vercel, add the same variables in Project Settings → Environment Variables.

If WeatherKit is not configured, the app falls back to NWS/Open-Meteo for forecasts.

## Data Sources

- **Radar:** [Iowa Environmental Mesonet](https://mesonet.agron.iastate.edu) — NEXRAD mosaics
- **Alerts:** [NWS Weather API](https://api.weather.gov) — Active polygon warnings
- **Radio:** NOAA Weather Radio station list (130 stations)

## Tech Stack

- React + Vite
- Leaflet.js for map rendering
- Iowa Mesonet XYZ tiles for radar
- NWS GeoJSON API for live alerts
- Apple WeatherKit for current conditions and forecasts (requires Apple Developer account)
- Vercel serverless function for hurricane data (NHC proxy)
- `sms:` URI scheme for emergency contacts
- Local-only storage — no account or backend required

## Built By

Andrew Gray — YouNeeK
