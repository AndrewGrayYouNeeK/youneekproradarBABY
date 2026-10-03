async function digest(value) {
  const bytes = new TextEncoder().encode(String(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(hash);
}

export async function secretsMatch(left, right) {
  const a = String(left ?? "");
  const b = String(right ?? "");
  if (!a || !b) return false;
  const [da, db] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i += 1) diff |= da[i] ^ db[i];
  return diff === 0;
}

export function accessKeyFromRequest(request) {
  const header = request?.headers?.get?.("authorization") || request?.headers?.get?.("Authorization") || "";
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

export async function authorizeStack(request, env = {}) {
  const expected = String(env.STACK_ACCESS_KEY ?? "").trim();
  if (!expected) return { ok: false, reason: "missing_access_key" };
  const provided = accessKeyFromRequest(request);
  const ok = await secretsMatch(provided, expected);
  return ok ? { ok: true, reason: "ok" } : { ok: false, reason: "denied" };
}
