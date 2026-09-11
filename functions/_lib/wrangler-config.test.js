import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("wrangler.toml names only youneekproradarbaby so Workers Builds can match the weather Worker", () => {
  const toml = readFileSync(join(root, "wrangler.toml"), "utf8");
  assert.match(toml, /^name = "youneekproradarbaby"$/m);
  assert.doesNotMatch(toml, /^\[env\./m);
  assert.doesNotMatch(toml, /name = "youneek-pro-radarynk222"/);
  assert.doesNotMatch(toml, /CLOUDFLARE_WORKER_NAME|WORKER_PROJECT\s*=/);
  assert.doesNotMatch(toml, /^SITE_ROLE\s*=/m);
});

test("no extra wrangler*.toml files that would fail the baby Workers Builds name check", () => {
  const extras = readdirSync(root).filter(
    (name) => /^wrangler.*\.(toml|json|jsonc)$/.test(name) && name !== "wrangler.toml"
  );
  assert.deepEqual(extras, []);
});

test("Workers assets are not given a Pages _redirects file", () => {
  assert.equal(existsSync(join(root, "public/_redirects")), false);
});
