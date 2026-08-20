import { onRequestGet as getAlerts } from "../functions/api/alerts.js";
import { onRequestGet as getActiveStorms } from "../functions/api/getActiveStorms.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/api/alerts") {
      return getAlerts({ request });
    }

    if (request.method === "GET" && pathname === "/api/getActiveStorms") {
      return getActiveStorms();
    }

    return env.ASSETS.fetch(request);
  },
};
