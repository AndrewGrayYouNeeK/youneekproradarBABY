# Deploy guide — two Cloudflare projects

This repo ships **two sites**. Do not publish the weather app as the landing homepage, and do not put WeatherKit secrets on the landing project.

| Cloudflare project | Job | Home page | WeatherKit secrets |
|---|---|---|---|
| **`youneekproradarbaby`** | **Weather website** — NOW, Hourly, 10 Day, Maps, Radio | `/Forecast` | **Yes** — runtime Variables and Secrets |
| **`youneek-pro-radarynk222`** | **Landing page** — welcome + live conditions teaser | `/landing` | **No** — set `WEATHER_APP_URL` instead |

The landing “Open the weather app” button goes to the weather website. Same-origin `/Forecast` is only the fallback when `WEATHER_APP_URL` is empty (local dev).

---

## Weather website (`youneekproradarbaby`)

| Setting | Value |
|---|---|
| Production branch | `main` (or this PR branch until it merges) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Add the four `WEATHERKIT_*` secrets here: [WEATHERKIT.md](./WEATHERKIT.md).

CLI: `npm run build && npm run deploy:weather`

---

## Landing page (`youneek-pro-radarynk222`)

| Setting | Value |
|---|---|
| Production branch | `main` (or this PR branch until it merges) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --env ynk222` |

Then add a **plain text variable** (not a WeatherKit secret):

| Name | Value |
|---|---|
| `WEATHER_APP_URL` | Full URL of the weather site, e.g. `https://youneekproradarbaby.<your-subdomain>.workers.dev` (no trailing slash) |

Find that URL in Cloudflare → youneekproradarbaby → **Triggers**. If the weather app has a custom domain, use that.

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

`/` and `/landing` show the landing page. `/Forecast` is the weather app.
