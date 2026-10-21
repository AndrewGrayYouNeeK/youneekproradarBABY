# Deploy guide — two Cloudflare projects

This repo is the landing page on **`youneekproradarbaby`**. Do not move **youneekproradar.com** or any DNS record. Do not deploy this build onto **`youneek-pro-radarynk222`** — that Worker is the separate radar app.

| Cloudflare project | Job | Home page | WeatherKit secrets |
|---|---|---|---|
| **`youneekproradarbaby`** | **Landing page** for youneekproradar.com, plus the weather desk | `/` | **Yes** — runtime Variables and Secrets |
| **`youneek-pro-radarynk222`** | **Radar app** (separate repo). This landing only links to it. | `/Radar` | Not in this repo |

The public website **https://youneekproradar.com** stays attached to **`youneekproradarbaby`**. Do not change that custom domain or DNS. `/` is the landing page. **Open Radar** goes to the separate radar app at `https://youneek-pro-radarynk222.youneekartifacts.workers.dev/Radar`. NOW, Hourly, and 10 Day remain on this site at `/Forecast`, `/Hourly`, and `/Daily`.

---

## Weather website (`youneekproradarbaby`)

| Setting | Value |
|---|---|
| Production branch | `main` (or this PR branch until it merges) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production deploy command | `npx wrangler versions upload` |

Do **not** add `--env ynk222` or `--name youneek-pro-radarynk222` on this project. Reset **both** the production and non-production commands if a previous note said to use `--env ynk222` here. That is what breaks **Workers Builds: youneekproradarbaby**.

Add the four `WEATHERKIT_*` secrets here: [WEATHERKIT.md](./WEATHERKIT.md). Do not add Variables whose names start with `CLOUDFLARE_`.

CLI: `npm run build && npm run deploy:weather`

---

## Radar app (`youneek-pro-radarynk222`)

Do not publish this repository there, and do not change its domain or DNS. The landing **Open Radar** button uses:

`https://youneek-pro-radarynk222.youneekartifacts.workers.dev/Radar`

Safety texts open `/Contacts` on that same origin. `npm run deploy:landing` still targets that Worker name for older dashboards — do not run it against the live radar app.

---

## GitHub publish (optional)

`.github/workflows/deploy-ynk222.yml` deploys **both** projects when `CLOUDFLARE_API_TOKEN` is set.

---

## API routes (weather website)

| Route | Purpose |
|---|---|
| `/api/weather?lat=&lon=` | Apple WeatherKit (falls back in the app to Open-Meteo) |
| `/api/weather-status` | Which WeatherKit secrets the **weather** Worker sees |
| `/api/site` | `landing` vs `weather` role + `WEATHER_APP_URL` |
| `/api/alerts` | NWS polygons |
| `/api/getActiveStorms` | NHC storms |

---

## Local dev

```bash
npm install
npm run dev
```

`/` and `/landing` are the landing page. `/Forecast` is the weather desk.
