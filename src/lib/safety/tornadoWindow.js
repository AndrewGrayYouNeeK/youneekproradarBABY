// Determine if the user is within an active tornado warning OR within
// POST_WINDOW_MS after the most recent tornado warning expired.
// This is the gate for sending "Help Me" / "I'm Safe" texts.

const POST_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours after expiration

const KEY = "safety_last_tornado_end_v1";

function isTornadoEvent(event) {
  if (!event) return false;
  const e = String(event).toLowerCase();
  return e.includes("tornado warning");
}

function getStoredLastEnd() {
  const v = parseInt(localStorage.getItem(KEY) || "0", 10);
  return Number.isFinite(v) ? v : 0;
}

function setStoredLastEnd(ms) {
  if (Number.isFinite(ms) && ms > 0) {
    const prev = getStoredLastEnd();
    if (ms > prev) localStorage.setItem(KEY, String(ms));
  }
}

// Inspect an alert features array (NWS GeoJSON) and return:
//   { active: boolean, lastEnd: number|null, alert: feature|null }
export function evaluateTornadoWindow(features) {
  let active = null;
  let latestEnd = 0;

  for (const f of features || []) {
    const ev = f?.properties?.event;
    if (!isTornadoEvent(ev)) continue;
    const ends = Date.parse(f?.properties?.ends || f?.properties?.expires || "");
    if (Number.isFinite(ends)) {
      if (ends > latestEnd) latestEnd = ends;
      // "active" if not yet expired
      if (ends > Date.now() && !active) active = f;
    } else if (!active) {
      // No end time but present in active alerts — treat as active.
      active = f;
    }
  }

  if (latestEnd > 0) setStoredLastEnd(latestEnd);

  const stored = getStoredLastEnd();
  const lastEnd = Math.max(latestEnd, stored) || null;
  const inPostWindow = !!lastEnd && Date.now() - lastEnd < POST_WINDOW_MS;

  return {
    active: !!active,
    inPostWindow,
    canSend: !!active || inPostWindow,
    lastEnd,
    alert: active,
    postWindowMs: POST_WINDOW_MS,
  };
}