import { DEFAULT_WEATHER_APP_URL, LANDING_PROJECT, PUBLIC_WEATHER_HOSTS, WEATHER_PROJECT } from "../site.js";

const WEATHER_HOST = PUBLIC_WEATHER_HOSTS[0];

export function stackCatalog() {
  return {
    cloudflare: {
      workers: [
        {
          name: WEATHER_PROJECT,
          role: "Weather website",
          url: `https://${WEATHER_HOST}`,
        },
        {
          name: LANDING_PROJECT,
          role: "Landing page",
          url: DEFAULT_WEATHER_APP_URL.replace(WEATHER_PROJECT, LANDING_PROJECT),
        },
      ],
      zones: [{ name: WEATHER_HOST }],
    },
    cursor: {
      environment: "YouNeeK Pro Radar",
      repository: "https://github.com/AndrewGrayYouNeeK/youneek-pro-radar",
    },
    apple: {
      products: ["WeatherKit"],
      serviceId: "com.youneek.proradar.weather",
      membershipUrl: "https://developer.apple.com/account",
      keysUrl: "https://developer.apple.com/account/resources/authkeys/list",
    },
  };
}
