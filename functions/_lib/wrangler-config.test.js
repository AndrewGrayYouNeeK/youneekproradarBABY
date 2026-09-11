import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("wrangler.toml names only youneekproradarbaby so Workers Builds can match the weather Worker", () => {
  const toml = readFileSync(new URL("../../wrangler.toml", import.meta.url), "utf8");
  assert.match(toml, /^name = "youneekproradarbaby"$/m);
  assert.doesNotMatch(toml, /^\[env\./m);
  assert.doesNotMatch(toml, /name = "youneek-pro-radarynk222"/);
});

test("landing Worker name lives in wrangler.landing.toml, not wrangler.toml", () => {
  const landing = readFileSync(new URL("../../wrangler.landing.toml", import.meta.url), "utf8");
  assert.match(landing, /^name = "youneek-pro-radarynk222"$/m);
  assert.match(landing, /SITE_ROLE = "landing"/);
});
