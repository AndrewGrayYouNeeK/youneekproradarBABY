import {
  DEFAULT_DOCK_IDS,
  MAP_DOCK_STORAGE_KEY,
  MAP_FEATURES,
  MAX_DOCK_CHIPS,
  getMapFeature,
  loadDockIds,
  saveDockIds,
} from "../src/lib/mapDesk.js";

const store = new Map();
globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, String(value));
  },
  removeItem(key) {
    store.delete(key);
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(getMapFeature("hourly")?.path === "/Hourly", "Hourly should open from the map desk");
assert(getMapFeature("settings")?.path === "/Settings", "Settings should be reachable from the map");
assert(getMapFeature("help")?.kind === "action", "Help Me should be a map action");
assert(DEFAULT_DOCK_IDS.includes("radar") && DEFAULT_DOCK_IDS.includes("radio"), "Default dock should keep radar and radio");

const saved = saveDockIds(["hourly", "help", "bogus", "radar"]);
assert(JSON.stringify(saved) === JSON.stringify(["hourly", "help", "radar"]), "Unknown chips should be dropped");
assert(JSON.parse(localStorage.getItem(MAP_DOCK_STORAGE_KEY)).length === 3, "Dock pins should persist");
assert(JSON.stringify(loadDockIds()) === JSON.stringify(["hourly", "help", "radar"]), "Pinned dock should reload");

const overflow = saveDockIds(["radar", "lightning", "satellite", "hurricanes", "alerts", "radio", "hourly", "help", "safe"]);
assert(overflow.length === MAX_DOCK_CHIPS, "Dock should cap at eight shortcuts");

const routes = MAP_FEATURES.filter((feature) => feature.kind === "route").map((feature) => feature.path);
for (const path of ["/Forecast", "/Hourly", "/Daily", "/Radio", "/Globe", "/Settings", "/Contacts"]) {
  assert(routes.includes(path), `${path} should be organized on the map desk`);
}

console.log("map desk tests passed");
