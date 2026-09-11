#!/usr/bin/env node
/**
 * Publish the landing page to youneek-pro-radarynk222.
 * Uses --name so wrangler.toml can keep the baby Worker name for Workers Builds.
 *
 * If this script is the dashboard deploy command on youneekproradarbaby,
 * deploy the connected Worker instead of renaming it to the landing project.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const LANDING_PROJECT = "youneek-pro-radarynk222";
const WEATHER_PROJECT = "youneekproradarbaby";

export function workersBuildsTarget(env = process.env) {
  if (env.WORKERS_CI !== "1" && !env.WRANGLER_CI_MATCH_TAG) return null;
  const connected = String(env.WRANGLER_CI_OVERRIDE_NAME || "").trim();
  if (connected === LANDING_PROJECT || connected.toLowerCase().includes("ynk222")) {
    return "landing";
  }
  return "weather";
}

export function workersBuildsPreview(env = process.env) {
  const branch = String(env.WORKERS_CI_BRANCH || "");
  return Boolean(branch) && branch !== "main";
}

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

export function main(env = process.env) {
  const buildsTarget = workersBuildsTarget(env);
  if (buildsTarget === "weather") {
    const cmd = workersBuildsPreview(env) ? ["versions", "upload"] : ["deploy"];
    log(`Workers Builds is connected to ${WEATHER_PROJECT}; publishing the weather website.`);
    return wrangler(cmd) ? 0 : 1;
  }

  const inCi = Boolean(env.CI || env.GITHUB_ACTIONS);
  if (inCi && !env.CLOUDFLARE_API_TOKEN && !env.WRANGLER_CI_MATCH_TAG) {
    log(
      `Skipping ${LANDING_PROJECT} landing deploy: CLOUDFLARE_API_TOKEN is not set.\n` +
        `Weather website: Cloudflare → ${WEATHER_PROJECT} → deploy command \`npx wrangler deploy\` (no --env)\n` +
        `Landing page:    wrangler deploy --name ${LANDING_PROJECT}`
    );
    return 0;
  }

  if (!existsSync("dist/index.html")) {
    console.error("dist/ is missing. Run `npm run build` first.");
    return 1;
  }

  log(`Publishing landing page to ${LANDING_PROJECT}…`);

  const landingCmd = workersBuildsPreview(env) ? ["versions", "upload"] : ["deploy"];
  if (
    wrangler([
      ...landingCmd,
      "--name",
      LANDING_PROJECT,
      "--var",
      "SITE_ROLE:landing",
      "--var",
      `WORKER_PROJECT:${LANDING_PROJECT}`,
    ])
  ) {
    log(`\nLanding Worker ${LANDING_PROJECT} updated. WeatherKit secrets stay on ${WEATHER_PROJECT}.`);
    return 0;
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
    return 0;
  }

  console.error(
    `\nCould not publish landing ${LANDING_PROJECT}.\n` +
      `In Cloudflare → Workers & Pages → ${LANDING_PROJECT}:\n` +
      `  • Connect this GitHub repo\n` +
      `  • Deploy command: npx wrangler deploy --name ${LANDING_PROJECT}\n` +
      `  • Set WEATHER_APP_URL to the ${WEATHER_PROJECT} weather site URL`
  );
  return 1;
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  process.exit(main());
}
