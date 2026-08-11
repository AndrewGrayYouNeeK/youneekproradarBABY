# Deploy guide — two apps, one repo

You have **two apps** in this single GitHub repo (`youneekproradarBABY`):

| App | Git branch | Cloudflare project | What it is |
|---|---|---|---|
| **Landing site** | `main` | `youneek-pro-radarynk222` | Marketing site, About, FAQ, full feature pages |
| **Actual radar app** | `app` | `youneekproradarbaby` | Streamlined radar tool (Radar, Contacts, Settings) |

Both are **Base44-free**.

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

These deploy automatically with the Pages project — no separate Worker needed.

If alert layers are missing on the map, confirm the `functions/` folder is in the deployed branch and retry the deployment.

---

## Cloudflare Pages setup

### 1. Landing site (`youneek-pro-radarynk222`)

1. Cloudflare → **Workers & Pages** → your landing project (or create one)
2. **Connect to Git** → repo: `AndrewGrayYouNeeK/youneekproradarBABY`
3. **Production branch:** `main`
4. Build command: `npm run build`
5. Build output: `dist`
6. Save and deploy

### 2. Radar app (`youneekproradarbaby`)

1. Cloudflare → **Workers & Pages** → your app project (or create one)
2. **Connect to Git** → same repo: `AndrewGrayYouNeeK/youneekproradarBABY`
3. **Production branch:** `app` ← important, not main
4. Build command: `npm run build`
5. Build output: `dist`
6. Save and deploy

Same repo, different branches. No second GitHub repo needed.

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
# Landing site
git checkout main && npm install && npm run dev

# Radar app
git checkout app && npm install && npm run dev
```
