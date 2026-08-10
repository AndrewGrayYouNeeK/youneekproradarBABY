# YouNeeK Pro Radar

A military-style NEXRAD radar and severe weather tracker — built for real storm chasers and weather enthusiasts.

## About

YouNeeK Pro Radar is a professional-grade weather radar application featuring live NEXRAD base reflectivity mosaics, NWS severe weather alert overlays, NOAA weather radio streaming, and an emergency shelter alert system. Designed to look like a tactical PPI scope with a dark, phosphor-green aesthetic.

## Architecture (Option C)

| Platform | Hosting | Forecasts | Alerts / Radar |
|---|---|---|---|
| **Web app** | Cloudflare Pages | NWS + Open-Meteo (free) | NWS + Iowa Mesonet |
| **iOS app** | App Store (later) | Apple WeatherKit (native) | Coming soon |

No Swift knowledge needed for the web app. The iOS app is a separate native project in `ios/` — see [ios/README.md](ios/README.md).

## Features

- **Live NEXRAD Radar** — Iowa Mesonet base reflectivity mosaics, auto-refreshing every 5 minutes
- **NWS Alert Overlays** — Real-time GeoJSON polygons for tornado, severe thunderstorm, flood, and winter storm warnings
- **NOAA Weather Radio** — 130 stations nationwide with auto-select by GPS location
- **I'M SHELTERING Button** — One-tap emergency SMS to up to 5 contacts with GPS coordinates
- **Dark Tactical UI** — PPI scope aesthetic, phosphor on black

## Running Locally (Web)

```bash
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radar.git
cd youneek-pro-radar
npm install
npm run dev
```

No API keys required — radar, alerts, and forecasts use free public APIs.

## Deploy to Cloudflare Pages

### One-time setup

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select this repo and configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Framework preset:** None (or Vite)
4. Deploy

Cloudflare automatically runs the `functions/` folder as Pages Functions:

- `/api/getActiveStorms` — hurricane data proxy (NHC)
- `/api/weather` — optional WeatherKit REST proxy (not used by web app)

### CLI deploy (optional)

```bash
npm install
npm run pages:deploy
```

Requires `npx wrangler login` first.

## Native iOS App (WeatherKit)

See **[ios/README.md](ios/README.md)** for step-by-step Xcode setup.

Summary:
1. Create Xcode project from files in `ios/YouNeeKProRadar/`
2. Enable **WeatherKit** on your App ID in Apple Developer portal
3. Add WeatherKit capability in Xcode
4. Run on your iPhone — forecasts use Apple's native API (no server needed)

Requires Apple Developer Program ($99/year). Includes 500,000 WeatherKit calls/month.

## Data Sources

- **Radar:** [Iowa Environmental Mesonet](https://mesonet.agron.iastate.edu)
- **Alerts:** [NWS Weather API](https://api.weather.gov)
- **Web forecasts:** [Open-Meteo](https://open-meteo.com) + NWS
- **iOS forecasts:** Apple WeatherKit
- **Radio:** NOAA Weather Radio station list

## Tech Stack

- React + Vite (web)
- Cloudflare Pages + Functions (hosting)
- SwiftUI + WeatherKit (iOS)
- Leaflet.js for map rendering
- Local-only storage — no account required

## Built By

Andrew Gray — YouNeeK
