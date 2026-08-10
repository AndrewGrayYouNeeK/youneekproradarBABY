# YouNeeK Pro Radar — iOS App (WeatherKit)

Native iOS companion app using **Apple WeatherKit** directly — no server proxy needed on the phone.

## Requirements

- Mac with **Xcode 15+**
- **Apple Developer Program** membership ($99/year)
- iPhone or simulator on **iOS 16+**

## 1. Create the Xcode project (one-time, ~10 min)

1. Open **Xcode** → **File → New → Project**
2. Choose **iOS → App**
3. Settings:
   - **Product Name:** `YouNeeKProRadar`
   - **Bundle Identifier:** `com.youneek.proradar` (must match your App ID)
   - **Interface:** SwiftUI
   - **Language:** Swift
4. Save the project inside this `ios/` folder

## 2. Add the source files

Drag these files from `ios/YouNeeKProRadar/` into your Xcode project (check **Copy items if needed**):

- `YouNeeKProRadarApp.swift`
- `ContentView.swift`
- `ForecastView.swift`
- `Services/WeatherService.swift` (contains `ForecastStore`)
- `Services/LocationManager.swift`

Delete Xcode's default `ContentView.swift` if it duplicates the one you added.

## 3. Enable WeatherKit in Apple Developer

1. Go to [developer.apple.com → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Create an **App ID** (type: App) with bundle ID `com.youneek.proradar`
3. Enable **WeatherKit** under Capabilities → Save

## 4. Enable WeatherKit in Xcode

1. Select your project → **Signing & Capabilities**
2. Choose your **Team** (Apple Developer account)
3. Click **+ Capability** → add **WeatherKit**
4. Add the entitlements file: `YouNeeKProRadar.entitlements`

## 5. Location permission

In Xcode, open your app's **Info** tab and add:

| Key | Value |
|---|---|
| `Privacy - Location When In Use Usage Description` | `YouNeeK Pro Radar uses your location to show local weather forecasts.` |

## 6. Run

1. Connect your iPhone or pick a simulator
2. Press **Run** (⌘R)
3. Allow location when prompted — forecasts load via WeatherKit

## What this app does (v1)

- Current conditions (temp, feels-like, condition icon)
- 24-hour hourly forecast
- 7-day daily forecast
- Pull to refresh

## Roadmap

The web app has radar, NWS alerts, and NOAA radio. Future iOS versions can add:

- WKWebView wrapper for the web radar
- Native WeatherKit alerts
- Push notifications for tornado warnings
- App Store release

## Troubleshooting

| Problem | Fix |
|---|---|
| `WeatherKit` import fails | Set deployment target to iOS 16+, add WeatherKit capability |
| 401 / auth errors | Confirm App ID has WeatherKit enabled; wait ~30 min after enabling |
| No location | Settings → Privacy → Location → allow for the app |
| "No development team" | Xcode → Settings → Accounts → sign in with Apple ID |

## Same Developer account

Your Apple Developer account covers:

- **This iOS app** — native WeatherKit (no API proxy)
- **Web app on Cloudflare** — optional; web uses free NWS/Open-Meteo
- **500,000 WeatherKit API calls/month** included with membership
