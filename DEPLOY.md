# Deploy guide — one codebase

Landing, radar, Forecast, and Globe now live in the **same branch** (`main` after this merge). You can still point two Cloudflare projects at this repo if you want separate marketing and app URLs.

| App | Cloudflare project | What it is |
|---|---|---|
| **Landing + radar** | `youneek-pro-radarynk222` and/or `youneekproradarbaby` | Welcome screen, Radar, WeatherKit Forecast, Globe, Contacts, Settings |

Both projects are **Base44-free**. If `youneekproradarbaby` is still set to production branch `app`, change it to `main` after this merge lands.

---

## Pages Functions (Workers)

The radar app (`youneekproradarbaby`) uses **Cloudflare Pages Functions** in the `functions/` folder:

| Route | Purpose |
|---|---|
| `/api/alerts?type=tornado` | NWS alert polygons for the radar map |
| `/api/alerts?type=tornado_watch` | Tornado watch polygons |
| `/api/alerts?type=thunderstorm` | Severe thunderstorm warnings |
| `/api/alerts?type=flood` | Flood / flash flood alerts |
| `/api/alerts?type=winter` | Winter weather alerts |
| `/api/getActiveStorms` | Hurricane data proxy (NHC) |
| `/api/weather?lat=&lon=` | Apple WeatherKit forecasts (requires Apple Developer credentials) |

These deploy automatically with the Pages project — no separate Worker needed.

**WeatherKit:** See [WEATHERKIT.md](./WEATHERKIT.md) to connect your Apple Developer account and set `WEATHERKIT_*` secrets in Cloudflare.

If alert layers are missing on the map, confirm the `functions/` folder is in the deployed branch and retry the deployment.

---

## Cloudflare setup (Workers Builds)

Your project uses **Workers Builds** (not classic Pages). That means:

- There is **no "build output directory" field** in the dashboard — it lives in `wrangler.toml` as `[assets] directory = "./dist"`.
- The default **deploy command** `npx wrangler deploy` is correct. Do not change it to `wrangler pages deploy`.

### Dashboard settings for `youneekproradarbaby`

1. Cloudflare → **Workers & Pages** → **youneekproradarbaby**
2. **Settings → Builds**
3. Set:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

4. Save, then **Retry deployment**

The `wrangler.toml` in the repo tells Cloudflare where your built files are (`dist/`) and how to serve the SPA + `/api/*` routes.

**Your live URL** will look like: `https://youneekproradarbaby.<your-subdomain>.workers.dev`  
It is **not** `youneekproradarbaby.workers.dev`. Find the exact URL in Cloudflare → Workers & Pages → youneekproradarbaby → **Triggers** or the project overview.

---

## Cloudflare Pages setup (if you switch later)

If you ever migrate to classic Pages Git instead of Workers Builds:

### 1. Landing site (`youneek-pro-radarynk222`)

1. Cloudflare → **Workers & Pages** → `youneek-pro-radarynk222`
2. **Connect to Git** → repo: `AndrewGrayYouNeeK/youneekproradarBABY`
3. **Production branch:** `main`
4. **Build command:** `npm run build`
5. **Build output directory:** `dist`
6. **Deploy command:** leave empty (Pages auto-publishes `dist` after build)
7. Save and deploy

### 2. Radar app (`youneekproradarbaby`)

Use Workers Builds settings above instead — this project is a Worker, not Pages.

---

## Tab title still says "base44"?

The old Base44 build shipped HTML with `<title>Base44 APP</title>`. If the tab still shows that after deploy:

1. In Cloudflare, open the project → **Deployments** → **Retry deployment** (or push a new commit).
2. Hard-refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac).
3. If you added the site to your home screen, remove the old shortcut and add it again so the PWA name updates.

---

## Custom domains

- Landing: point your marketing domain to the `youneek-pro-radarynk222` project
- App: point your app domain to the `youneekproradarbaby` project

---

## Local dev

```bash
git checkout main
npm install
npm run dev
```

Open `/landing` for the welcome screen, then Radar / Forecast / Globe from there.
