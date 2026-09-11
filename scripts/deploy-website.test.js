import assert from "node:assert/strict";
import test from "node:test";
import { workersBuildsPreview, workersBuildsTarget } from "./deploy-website.mjs";

test("Workers Builds on baby deploys the weather Worker, not landing", () => {
  assert.equal(
    workersBuildsTarget({
      WORKERS_CI: "1",
      WRANGLER_CI_OVERRIDE_NAME: "youneekproradarbaby",
      WRANGLER_CI_MATCH_TAG: "abc",
    }),
    "weather"
  );
  assert.equal(
    workersBuildsTarget({
      WORKERS_CI: "1",
      WRANGLER_CI_OVERRIDE_NAME: "youneek-pro-radarynk222",
    }),
    "landing"
  );
  assert.equal(workersBuildsTarget({}), null);
});

test("non-main Workers Builds branches are previews", () => {
  assert.equal(workersBuildsPreview({ WORKERS_CI_BRANCH: "cursor/fix-weatherbug-jump-weatherkit-c72c" }), true);
  assert.equal(workersBuildsPreview({ WORKERS_CI_BRANCH: "main" }), false);
});
