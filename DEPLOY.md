# Deploy guide — two apps, one repo

You have **two apps** in this single GitHub repo (`youneekproradarBABY`):

| App | Git branch | Cloudflare project | What it is |
|---|---|---|---|
| **Landing site** | `main` | `youneekproradarbaby` | Marketing site, About, FAQ, full feature pages |
| **Actual radar app (YNK222)** | `app` | `youneek-pro-radarynk222` | Streamlined radar tool (Radar, Contacts, Settings) |

Both are **Base44-free**.

---

## Cloudflare Pages setup

### 1. Landing site (`youneekproradarbaby`)

1. Cloudflare → **Workers & Pages** → your landing project (or create one)
2. **Connect to Git** → repo: `AndrewGrayYouNeeK/youneekproradarBABY`
3. **Production branch:** `main`
4. Build command: `npm run build`
5. Build output: `dist`
6. Save and deploy

### 2. Radar app (`youneek-pro-radarynk222`)

1. Cloudflare → **Workers & Pages** → your app project (or create one)
2. **Connect to Git** → same repo: `AndrewGrayYouNeeK/youneekproradarBABY`
3. **Production branch:** `app` ← important, not main
4. Build command: `npm run build`
5. Build output: `dist`
6. Save and deploy

Same repo, different branches. No second GitHub repo needed.

---

## Custom domains

- Landing: point your marketing domain to the `youneekproradarbaby` project
- App: point your app domain to the `youneek-pro-radarynk222` project

---

## Local dev

```bash
# Landing site
git checkout main && npm install && npm run dev

# Radar app
git checkout app && npm install && npm run dev
```
