import assert from "node:assert/strict";
import {
  buildEmergencyBody,
  buildImSafeBody,
  buildSmsUrl,
} from "../src/lib/safety/sms.js";

function withUserAgent(userAgent, platform, fn) {
  const original = navigator.userAgent;
  const originalPlatform = navigator.platform;
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: userAgent });
  Object.defineProperty(navigator, "platform", { configurable: true, value: platform });
  try {
    return fn();
  } finally {
    Object.defineProperty(navigator, "userAgent", { configurable: true, value: original });
    Object.defineProperty(navigator, "platform", { configurable: true, value: originalPlatform });
  }
}

const help = buildEmergencyBody({ locationLine: "My location: https://maps.google.com/?q=37.1,-85.3" });
assert.match(help, /HELP ME/);
assert.match(help, /maps\.google\.com/);

const safe = buildImSafeBody({ locationLine: "My location: https://maps.google.com/?q=37.1,-85.3" });
assert.match(safe, /I'M SAFE/);

withUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "iPhone", () => {
  assert.equal(buildSmsUrl(["+15555550100"], "HELP ME"), "sms:+15555550100&body=HELP%20ME");
  assert.match(buildSmsUrl(["+15555550100", "+15555550101"], "I'm safe"), /^sms:\/open\?addresses=/);
});

withUserAgent("Mozilla/5.0 (Linux; Android 14)", "Linux armv8l", () => {
  assert.equal(
    buildSmsUrl(["+15555550100", "+15555550101"], "HELP ME"),
    "sms:+15555550100,+15555550101?body=HELP%20ME"
  );
});

console.log("sms helpers ok");
