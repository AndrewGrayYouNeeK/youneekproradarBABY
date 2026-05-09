// Local-only contacts storage. No backend, no PII transmission.
const KEY = "safety_contacts_v1";
const MSG_KEY = "safety_message_v1";
const SAFE_MSG_KEY = "safety_safe_message_v1";

export const DEFAULT_MESSAGE =
  "HELP ME. I need assistance — severe weather in my area. Here's my current location:";

export const DEFAULT_SAFE_MESSAGE =
  "I'M SAFE. The tornado warning has passed and I'm okay. Here's my current location:";

export function loadContacts() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveContacts(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
}

export function loadMessage() {
  return localStorage.getItem(MSG_KEY) || DEFAULT_MESSAGE;
}

export function saveMessage(msg) {
  localStorage.setItem(MSG_KEY, msg || DEFAULT_MESSAGE);
}

export function loadSafeMessage() {
  return localStorage.getItem(SAFE_MSG_KEY) || DEFAULT_SAFE_MESSAGE;
}

export function saveSafeMessage(msg) {
  localStorage.setItem(SAFE_MSG_KEY, msg || DEFAULT_SAFE_MESSAGE);
}

export function cleanPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
  if (digits.length > 11) return `+${digits}`;
  return null;
}

export function formatDisplay(phone) {
  if (!phone) return "";
  const d = String(phone).replace(/\D/g, "").replace(/^1/, "");
  if (d.length !== 10) return phone;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// Build the SMS body — opens the device's native SMS app.
// iOS uses '&body=', Android uses '?body=' — sms: with semicolon-separated numbers
// works across both with the modern format.
export function buildSmsHref(numbers, message, location) {
  const parts = [];
  parts.push(message || DEFAULT_MESSAGE);
  if (location?.latitude && location?.longitude) {
    const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    parts.push(mapsUrl);
  }
  const body = encodeURIComponent(parts.join("\n"));
  const recipients = (numbers || []).filter(Boolean).join(",");

  // iOS: sms:/open/?addresses=...&body=...
  // Most platforms accept: sms:NUMBER1,NUMBER2?body=...
  return `sms:${recipients}?&body=${body}`;
}