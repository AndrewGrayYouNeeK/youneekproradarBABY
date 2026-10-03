# Deploy guide — two Cloudflare projects

This repo ships **two sites**. Do not publish the weather app as the landing homepage, and do not put WeatherKit secrets on the landing project.

| Cloudflare project | Job | Home page | WeatherKit secrets |
|---|---|---|---|
| **`youneekproradarbaby`** | **Weather website** — NOW, Hourly, 10 Day, Maps, Radio | `/Forecast` | **Yes** — runtime Variables and Secrets |
| **`youneek-pro-radarynk222`** | **Landing page** — welcome + live conditions teaser | `/landing` | **No** — set `WEATHER_APP_URL` instead |

The public website **https://youneekproradar.com** is the weather app (NOW / Hourly / 10 Day / Maps / Radio). It is attached to **`youneekproradarbaby`**.

The landing “Open the weather app” button goes to that weather website (`https://youneekproradarbaby.youneekartifacts.workers.dev` unless you set `WEATHER_APP_URL`).

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

## Landing page (`youneek-pro-radarynk222`)

| Setting | Value |
|---|---|
| Production branch | `main` (or this PR branch until it merges) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --name youneek-pro-radarynk222` |

Then add a **plain text variable** (not a WeatherKit secret):

| Name | Value |
|---|---|
| `WEATHER_APP_URL` | Full URL of the weather site. Default in code: `https://youneekproradarbaby.youneekartifacts.workers.dev` (no trailing slash) |

The weather Worker also serves **https://youneekproradar.com**. If that hostname is still on `youneek-pro-radarynk222`, remove it there after this deploy so baby can take it.

CLI: `npm run build && npm run deploy:landing`

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

`/` and `/Forecast` show the weather app (NOW). `/landing` is the splash page.
