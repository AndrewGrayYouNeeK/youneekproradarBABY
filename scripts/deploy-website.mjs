#!/usr/bin/env node
/**
 * Publish the landing page to youneek-pro-radarynk222.
 * The weather website stays on youneekproradarbaby (`wrangler deploy`).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const LANDING_PROJECT = "youneek-pro-radarynk222";
const WEATHER_PROJECT = "youneekproradarbaby";

function log(message) {
  console.log(message);
}

function wrangler(args) {
  log(`\n> npx wrangler ${args.join(" ")}`);
  const result = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status === 0;
}

const inCi = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
if (inCi && !process.env.CLOUDFLARE_API_TOKEN) {
  log(
    `Skipping ${LANDING_PROJECT} landing deploy: CLOUDFLARE_API_TOKEN is not set.\n` +
      `Weather website: Cloudflare → ${WEATHER_PROJECT} → deploy command \`npx wrangler deploy\`\n` +
      `Landing page:    Cloudflare → ${LANDING_PROJECT} → deploy command \`npx wrangler deploy --config wrangler.landing.toml\``
  );
  process.exit(0);
}

if (!existsSync("dist/index.html")) {
  console.error("dist/ is missing. Run `npm run build` first.");
  process.exit(1);
}

log(`Publishing landing page to ${LANDING_PROJECT}…`);

if (wrangler(["deploy", "--config", "wrangler.landing.toml"])) {
  log(`\nLanding Worker ${LANDING_PROJECT} updated. WeatherKit secrets stay on ${WEATHER_PROJECT}.`);
  process.exit(0);
}

log(`\nWorker deploy did not succeed (project may still be Pages). Trying Pages…`);

if (
  wrangler([
    "pages",
    "deploy",
    "dist",
    "--project-name",
    LANDING_PROJECT,
    "--branch",
    "main",
    "--commit-dirty=true",
  ])
) {
  log(`\nPages landing ${LANDING_PROJECT} updated.`);
  process.exit(0);
}

console.error(
  `\nCould not publish landing ${LANDING_PROJECT}.\n` +
    `In Cloudflare → Workers & Pages → ${LANDING_PROJECT}:\n` +
    `  • Connect this GitHub repo\n` +
    `  • Deploy command: npx wrangler deploy --config wrangler.landing.toml\n` +
    `  • Set WEATHER_APP_URL to the ${WEATHER_PROJECT} weather site URL`
);
process.exit(1);
