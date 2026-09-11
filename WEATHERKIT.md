# Apple WeatherKit setup

This app can use [Apple WeatherKit](https://developer.apple.com/weatherkit/) for current conditions and forecasts via `/api/weather`. Radar and NWS alerts work without Apple credentials; WeatherKit is optional but higher quality for forecast data.

## Requirements

- **Apple Developer Program** membership ($99/year)
- A Mac is helpful for iOS/Xcode, but **web + Cloudflare only needs the REST API key** below

## Step 1 — Enroll in Apple Developer Program

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs/)
2. Sign in with your Apple ID and enroll (or renew) the Developer Program
3. Note your **Team ID** (10 characters): [developer.apple.com/account → Membership details](https://developer.apple.com/account)

## Step 2 — Register a Services ID

1. Open [Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click **+** → choose **Services IDs** → Continue
3. Description: `YouNeeK Pro Radar Weather`
4. Identifier: `com.youneek.proradar.weather` (must be unique to your account)
5. Enable **WeatherKit** → Configure if prompted → Save

This Services ID becomes your `WEATHERKIT_SERVICE_ID`.

## Step 3 — Create a WeatherKit API key

1. Go to [Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click **+** to create a key
3. Name: `YouNeeK Pro Radar WeatherKit`
4. Enable **WeatherKit**
5. Register → **Download** the `.p8` file (you can only download it once)
6. Note the **Key ID** shown on the page → this is `WEATHERKIT_KEY_ID`

## Step 4 — Local development

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Fill in `.env`:

   | Variable | Value |
   |---|---|
   | `WEATHERKIT_TEAM_ID` | Your 10-character Team ID |
   | `WEATHERKIT_KEY_ID` | Key ID from step 3 |
   | `WEATHERKIT_SERVICE_ID` | Services ID from step 2 (e.g. `com.youneek.proradar.weather`) |
   | `WEATHERKIT_PRIVATE_KEY` | Contents of the `.p8` file |

   For the private key, either paste the full PEM with real newlines inside quotes, or use `\n` for line breaks on one line:

   ```
   WEATHERKIT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----"
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Test (replace lat/lon with your location):

   ```bash
   curl "http://localhost:5173/api/weather?lat=37.77&lon=-122.42&dataSets=currentWeather"
   ```

   - **503** → credentials missing or incomplete in `.env`
   - **200** → WeatherKit is working

## Step 5 — Production (Cloudflare — weather website)

There are **two** Cloudflare projects:

- **`youneekproradarbaby`** — weather website. Put WeatherKit secrets **here**.
- **`youneek-pro-radarynk222`** — landing page. Do **not** put WeatherKit secrets here. Set `WEATHER_APP_URL` to the weather site instead (see [DEPLOY.md](./DEPLOY.md)).

Secrets must be **runtime Variables and Secrets** on `youneekproradarbaby`, not Build variables.

1. Cloudflare → **Workers & Pages** → **youneekproradarbaby**
2. **Settings → Variables and Secrets** (the Worker runtime page)
3. Add four **encrypted secrets** with these exact names:

| Name | Value |
|---|---|
| `WEATHERKIT_TEAM_ID` | 10-character Team ID |
| `WEATHERKIT_KEY_ID` | 10-character Key ID from the WeatherKit key |
| `WEATHERKIT_SERVICE_ID` | Services ID, e.g. `com.youneek.proradar.weather` |
| `WEATHERKIT_PRIVATE_KEY` | Full `.p8` as **one line** with `\n` for breaks |

If you still open a preview URL for the same Worker, it already uses these secrets. The **landing** project `youneek-pro-radarynk222` should not get copies of them.

Example private key value:

```
-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----
```

Do **not** put them under **Builds → Variables**. Build secrets are only available during `npm run build`. The weather API runs later, on the Worker, and will still say “not configured.”

After saving runtime secrets you do **not** need to paste them again. Open **Settings on the weather website** — it lists which of the four names that Worker actually sees.

Or from a terminal (default Worker = weather website):

```bash
npx wrangler secret put WEATHERKIT_TEAM_ID
npx wrangler secret put WEATHERKIT_KEY_ID
npx wrangler secret put WEATHERKIT_SERVICE_ID
npx wrangler secret put WEATHERKIT_PRIVATE_KEY
```

Deploy the weather website with `npx wrangler deploy` (see [DEPLOY.md](./DEPLOY.md)).

## API usage

```
GET /api/weather?lat=37.77&lon=-122.42
```

| Parameter | Required | Description |
|---|---|---|
| `lat` | Yes | Latitude |
| `lon` | Yes | Longitude |
| `dataSets` | No | Comma-separated WeatherKit data sets. Default: `currentWeather,forecastHourly,forecastDaily,forecastNextHour,weatherAlerts`. The Worker always sends `country=US` so Apple weather alerts can return. |
| `timezone` | No | IANA timezone (e.g. `America/New_York`). The app sends the device timezone. Do not send `auto`. |

The Worker requests US customary units (`units=s`). Invalid values like `us` or `si` can make Apple 302/fail, and the app would silently fall back to Open-Meteo. NOW / Hourly / 10 Day show **Powered by Apple Weather** when WeatherKit is actually serving data.

## Troubleshooting

| Problem | Fix |
|---|---|
| `WeatherKit is not configured` | Secrets are not on **youneekproradarbaby** (the weather website) runtime Variables and Secrets. The landing page does not use these secrets. |
| Worker sees the secrets but Apple 401 | WeatherKit must be enabled on **both** the Services ID and the .p8 key. Team ID / Key ID / Services ID must match. |
| Private key could not be read | Dashboard stripped newlines. Paste as one line with `\n`. Include BEGIN/END. |
| Still showing Open-Meteo | Open Settings in the app. If a secret is red, the Worker never received it. If all four are green, the Apple token is being rejected — not a missing-secret problem. |

## Pricing note

Apple includes **500,000 WeatherKit API calls per month** with Developer Program membership. See [Apple's WeatherKit documentation](https://developer.apple.com/documentation/weatherkit) for limits and billing beyond that.
