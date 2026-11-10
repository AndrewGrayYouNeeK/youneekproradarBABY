import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APP_DOWNLOAD_LABEL,
  APP_DOWNLOAD_URL,
  EXAMPLE_SMS,
  FEATURES,
  HOW_POINTS,
  ONE_TIME_PRICE,
  POSITIONING,
  SHELTER_REVIEW_NOTE,
  SUBHEAD,
  SUPPORT_CONTACT,
  YOUNEEK_HOME_URL,
  appDownloadHref,
  appDownloadIsLive,
  oneTimePriceLabel,
  supportHref,
} from "./launch.js";

test("store link and support stay empty, and the one-time price is $6.99", () => {
  assert.equal(APP_DOWNLOAD_URL, "");
  assert.equal(APP_DOWNLOAD_LABEL, "Join TestFlight");
  assert.equal(appDownloadIsLive(), false);
  assert.equal(appDownloadHref(), "#waitlist");
  assert.equal(appDownloadHref("not a url"), "#waitlist");
  assert.equal(appDownloadIsLive("https://testflight.apple.com/join/example"), true);
  assert.equal(ONE_TIME_PRICE, "$6.99");
  assert.equal(oneTimePriceLabel(), "$6.99");
  assert.equal(oneTimePriceLabel("4.99"), "$4.99");
  assert.equal(oneTimePriceLabel("$4.99"), "$4.99");
  assert.equal(SUPPORT_CONTACT, "");
  assert.equal(supportHref(), "#support");
  assert.equal(supportHref("andrew@example.com"), "mailto:andrew@example.com");
  assert.equal(supportHref("https://youneek.dev/support"), "https://youneek.dev/support");
  assert.equal(YOUNEEK_HOME_URL, "https://youneek.dev");
});

test("homepage metadata uses the positioning line and skips generic weather-app wording", () => {
  const html = readFileSync(new URL("../../../index.html", import.meta.url), "utf8");
  assert.equal(POSITIONING, "Tactical NEXRAD radar + real NWS polygons + one-tap emergency shelter text. Ad-free. One-time purchase.");
  assert.equal(html.split(POSITIONING).length - 1, 3);
  assert.match(html, /property="og:description"/);
  assert.match(html, /name="twitter:description"/);
  assert.equal(/weather app/i.test(html), false);
});

test("launch copy matches the current radar app", () => {
  const published = JSON.stringify({ FEATURES, HOW_POINTS, SUBHEAD, SHELTER_REVIEW_NOTE });
  assert.match(SUBHEAD, /nearest NOAA Weather Radio station and frequency/);
  assert.match(SUBHEAD, /NEXRAD mosaics/);
  assert.match(published, /Iowa Mesonet base reflectivity, refreshed automatically/);
  assert.match(published, /Individual radar sites are in Layers/);
  assert.match(published, /Tornado, severe thunderstorm, flood, and winter/);
  assert.match(published, /last forecast and alerts stay available offline/);
  assert.match(SHELTER_REVIEW_NOTE, /tap Send/);
  assert.equal(/listen|stream|play the|in-app audio/i.test(published), false);
  assert.equal(published.includes("works offline for core"), false);
  assert.equal(published.includes("Making it rain"), false);
  assert.match(EXAMPLE_SMS, /maps\.google\.com/);
  assert.match(EXAMPLE_SMS, /37\.0000, -97\.0000/);
});
