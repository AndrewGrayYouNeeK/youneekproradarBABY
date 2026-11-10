/**
 * App-launch switchboard for the landing page.
 * TODO(Andrew): fill the empty constants before the App Store submission.
 * Do not invent a TestFlight URL, a price, or a support address.
 */

/** TODO(Andrew): paste the TestFlight or App Store URL. Leave "" until it exists. */
export const APP_DOWNLOAD_URL = "";

/**
 * TODO(Andrew): keep "Join TestFlight" until APP_DOWNLOAD_URL is the App Store
 * link, then change this to "Get the App".
 */
export const APP_DOWNLOAD_LABEL = "Join TestFlight";

/** Andrew's one-time App Store price. The pricing section shows this amount. */
export const ONE_TIME_PRICE = "$6.99";

/**
 * TODO(Andrew): support email or https contact URL. Leave "" until one exists.
 * The public /support page reads this constant and stays flagged while it is empty.
 */
export const SUPPORT_CONTACT = "";

/** Site title and social cards. Do not swap this for generic weather-app wording. */
export const POSITIONING =
  "Tactical NEXRAD radar + real NWS polygons + one-tap emergency shelter text. Ad-free. One-time purchase.";

export const YOUNEEK_HOME_URL = "https://youneek.dev";

export const HEADLINE = "Tactical radar. Live alerts. One-tap shelter.";

/**
 * NOAA Weather Radio finds the nearest NWS transmitter and shows its call sign
 * and frequency. The app does not play or stream the audio.
 */
export const SUBHEAD =
  "Live NEXRAD mosaics, NWS warning polygons, your nearest NOAA Weather Radio station and frequency, and a one-tap “I’m Sheltering” button that texts your people with your location.";

export const PURCHASE_LINE = "Ad-free. One-time purchase.";

export const TITLE_LINE = "Tactical NEXRAD. Live alerts. One-tap shelter.";

export const NEON_LINE = "Designed for the people who actually watch the radar.";

export const SAFETY_HEADING = "When it counts, one tap is enough.";

export const SAFETY_BODY =
  "Hit “I’m Sheltering” and the app texts your emergency contacts with your exact coordinates and a Google Maps link. No typing. No searching for numbers. Just a clear signal that you’re safe and where you are.";

export const SAFETY_CLOSE = "Built for the moments when the sky turns serious.";

/** Supporting detail. Does not replace Andrew's safety paragraph. */
export const SHELTER_REVIEW_NOTE =
  "On iOS you review the draft and tap Send in Messages. Nothing is sent until you do. Contacts stay on your phone. The button shows when a severe warning covers your location.";

/** Fixed example. Not the visitor's location and not a sent message. */
export const EXAMPLE_SMS = [
  "I'M SHELTERING",
  "I'm safe. This is where I am.",
  "37.0000, -97.0000",
  "https://maps.google.com/?q=37.0000,-97.0000",
].join("\n");

/**
 * The default radar is the Iowa Mesonet national reflectivity mosaic.
 * It reloads on a five-minute timer. Single-site reflectivity and velocity
 * are chosen in Layers.
 */
export const FEATURES = [
  {
    id: "nexrad",
    title: "Live NEXRAD",
    body: "Iowa Mesonet base reflectivity, refreshed automatically. See what’s actually out there.",
  },
  {
    id: "alerts",
    title: "NWS Alerts",
    body: "Tornado, severe thunderstorm, flood, and winter warnings drawn as real polygons on the map.",
  },
  {
    id: "shelter",
    title: "I’m Sheltering",
    body: "One tap sends your location and a map link to the people who need to know.",
  },
  {
    id: "purchase",
    title: "No ads. No subscription.",
    body: "Pay once. Keep it forever.",
  },
];

export const HOW_HEADING = "Radar when you need it. Safety when it matters.";

/**
 * How-it-works lines that match youneek-pro-radarYNK222 main.
 * Offline covers the app shell and the last forecast and alerts, not live radar tiles.
 */
export const HOW_POINTS = [
  "Live national mosaic, refreshed automatically. Individual radar sites are in Layers.",
  "Real NWS warning outlines, not just text alerts.",
  "Finds your nearest NOAA Weather Radio station and frequency.",
  "Location-aware. Once loaded, the app shell and the last forecast and alerts stay available offline.",
];

export const SCREEN_PLACEHOLDERS = [
  {
    id: "radar",
    title: "Radar",
    caption: "Placeholder screen. Replace with a phone screenshot of the national mosaic.",
  },
  {
    id: "alerts",
    title: "Alerts",
    caption: "Placeholder screen. Replace with a phone screenshot of NWS warning polygons.",
  },
  {
    id: "shelter",
    title: "Shelter",
    caption: "Placeholder screen. Replace with a phone screenshot of the shelter text flow.",
  },
];

export function appDownloadHref(url = APP_DOWNLOAD_URL) {
  const value = String(url || "").trim();
  if (!/^https?:\/\//i.test(value)) return "#waitlist";
  return value;
}

export function appDownloadIsLive(url = APP_DOWNLOAD_URL) {
  return appDownloadHref(url) !== "#waitlist";
}

export function oneTimePriceLabel(amount = ONE_TIME_PRICE) {
  const value = String(amount || "").trim();
  if (!value) return "";
  return value.startsWith("$") ? value : `$${value}`;
}

export function supportHref(contact = SUPPORT_CONTACT) {
  const value = String(contact || "").trim();
  if (!value) return "#support";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes("@") && !value.includes(" ")) return `mailto:${value}`;
  return "#support";
}
