#!/usr/bin/env node
/**
 * Publish this build to the live website project: youneek-pro-radarynk222.
 *
 * Tries a Workers + Assets deploy first (wrangler.toml [env.ynk222]).
 * If that project is still classic Pages, falls back to `wrangler pages deploy`.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const WEBSITE_PROJECT = "youneek-pro-radarynk222";

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
    `Skipping ${WEBSITE_PROJECT} deploy: GitHub secret CLOUDFLARE_API_TOKEN is not set.\n` +
      `Add it under repo Settings → Secrets, or in Cloudflare open ${WEBSITE_PROJECT} and set:\n` +
      `  Build command:  npm run build\n` +
      `  Deploy command: npx wrangler deploy --env ynk222`
  );
  process.exit(0);
}

if (!existsSync("dist/index.html")) {
  console.error("dist/ is missing. Run `npm run build` first.");
  process.exit(1);
}

log(`Publishing to website project ${WEBSITE_PROJECT}…`);

if (wrangler(["deploy", "--env", "ynk222"])) {
  log(`\nWorker ${WEBSITE_PROJECT} updated.`);
  process.exit(0);
}

log(`\nWorker deploy did not succeed (project may still be Pages). Trying Pages…`);

if (
  wrangler([
    "pages",
    "deploy",
    "dist",
    "--project-name",
    WEBSITE_PROJECT,
    "--branch",
    "main",
    "--commit-dirty=true",
  ])
) {
  log(`\nPages project ${WEBSITE_PROJECT} updated (production branch).`);
  process.exit(0);
}

console.error(
  `\nCould not publish ${WEBSITE_PROJECT}.\n` +
    `In Cloudflare → Workers & Pages → ${WEBSITE_PROJECT}:\n` +
    `  • Connect this GitHub repo\n` +
    `  • Production branch: main (or this PR branch until it merges)\n` +
    `  • If Workers Builds: deploy command \`npx wrangler deploy --env ynk222\`\n` +
    `  • If Pages: build \`npm run build\`, output directory \`dist\``
);
process.exit(1);
