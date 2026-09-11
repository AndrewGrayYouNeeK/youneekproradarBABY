# Deploy guide — website is youneek-pro-radarynk222

The app you open in the browser is Cloudflare project **`youneek-pro-radarynk222`** (YouNeeK Pro Radar YNK222).  
`youneekproradarbaby` is a second Worker used by Workers Builds. Code that only deploys to baby **will not show up on the website**.

| Cloudflare project | Role |
|---|---|
| **`youneek-pro-radarynk222`** | **Live website / custom domain.** This is the one that must receive this repo and WeatherKit secrets. |
| `youneekproradarbaby` | Extra Worker. Keep in sync if you still open that URL. |

---

## 1. Point YNK222 at this repo (required)

Open [Cloudflare → Workers & Pages → youneek-pro-radarynk222](https://dash.cloudflare.com) and connect GitHub repo `AndrewGrayYouNeeK/youneekproradarBABY`.

### If the project is Workers Builds (recommended)

| Setting | Value |
|---|---|
| Production branch | `main` (or this PR branch until it merges) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --env ynk222` |

That `--env ynk222` flag is what publishes as **youneek-pro-radarynk222** instead of baby. Then **Retry deployment**.

### If the project is still classic Pages

| Setting | Value |
|---|---|
| Production branch | `main` (or this PR branch until it merges) |
| Build command | `npm run build` |
| Build output directory | `dist` |

Pages Functions in `functions/` deploy with the site. `public/_redirects` keeps client routes on `index.html`; `/api/*` stays on Functions.

---

## 2. WeatherKit secrets on the website

Add all four on **youneek-pro-radarynk222** → **Settings → Variables and Secrets** (runtime, not Builds):

- `WEATHERKIT_TEAM_ID`
- `WEATHERKIT_KEY_ID`
- `WEATHERKIT_SERVICE_ID`
- `WEATHERKIT_PRIVATE_KEY`

If you also use baby, paste the same four there. Secrets do not copy between projects. Details: [WEATHERKIT.md](./WEATHERKIT.md).

From a terminal logged into Wrangler:

```bash
npx wrangler secret put WEATHERKIT_TEAM_ID --env ynk222
npx wrangler secret put WEATHERKIT_KEY_ID --env ynk222
npx wrangler secret put WEATHERKIT_SERVICE_ID --env ynk222
npx wrangler secret put WEATHERKIT_PRIVATE_KEY --env ynk222
```

---

## 3. GitHub publish (optional backup)

Workflow `.github/workflows/deploy-ynk222.yml` runs `npm run deploy:website` on `main` and this fix branch.

Add repo secrets:

- `CLOUDFLARE_API_TOKEN` — Account token with Workers Scripts + Pages edit
- `CLOUDFLARE_ACCOUNT_ID` — your account id

Without that token the workflow skips deploy and prints how to use the Cloudflare dashboard instead.

---

## 4. Local / CLI

```bash
npm run build
npm run deploy:ynk222      # Worker named youneek-pro-radarynk222
npm run deploy:website     # Worker, then Pages fallback
npm run deploy             # youneekproradarbaby only
```

---

## API routes (same codebase)

| Route | Purpose |
|---|---|
| `/api/alerts?type=tornado` | NWS alert polygons |
| `/api/getActiveStorms` | Hurricane data proxy (NHC) |
| `/api/weather?lat=&lon=` | Apple WeatherKit forecasts |
| `/api/weather-status` | Which WeatherKit secrets this project sees |

---

## baby Worker (optional)

`youneekproradarbaby` can keep:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

That URL is **not** the website. Custom domains belong on **youneek-pro-radarynk222**.

---

## Tab title still says "base44"?

Retry the **YNK222** deployment, then hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`). Remove and re-add any home-screen shortcut.

---

## Local dev

```bash
git checkout main
npm install
npm run dev
```

Open `/landing` for the welcome screen, then Radar / Forecast / Globe from there.
