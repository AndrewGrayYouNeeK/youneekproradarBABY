export function loadShelterContacts() {
  try {
    const v2 = JSON.parse(localStorage.getItem("shelterContacts_v2") || "null");
    if (Array.isArray(v2) && v2.length > 0 && v2[0]?.phone) return v2;
    const legacy = JSON.parse(localStorage.getItem("shelterContacts") || "[]");
    return legacy.map((phone, index) => ({ id: String(index), name: `Contact ${index + 1}`, phone }));
  } catch {
    return [];
  }
}

export function uniqueContactPhones(contacts) {
  return [...new Set((contacts || []).map((contact) => contact.phone).filter(Boolean))];
}

function isAppleMobile() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function buildSmsUrl(phones, body) {
  const list = (Array.isArray(phones) ? phones : [phones]).filter(Boolean);
  const encodedBody = encodeURIComponent(body);

  if (list.length === 0) return "";

  if (isAppleMobile()) {
    if (list.length === 1) {
      return `sms:${list[0]}&body=${encodedBody}`;
    }
    return `sms:/open?addresses=${list.map(encodeURIComponent).join(",")}&body=${encodedBody}`;
  }

  const recipients = list.join(",");
  return `sms:${recipients}?body=${encodedBody}`;
}

export function buildEmergencyBody({ locationLine }) {
  return [
    "HELP ME — Emergency. I need help right now and I am taking shelter.",
    locationLine,
    "Sent from YouNeeK Pro Radar. One-tap Help Me.",
  ].join("\n");
}

export function buildImSafeBody({ locationLine, context }) {
  return [
    context || "I'M SAFE — I am OK, accounted for, and do not need help.",
    locationLine,
    "Sent from YouNeeK Pro Radar. One-tap I'm Safe.",
  ].join("\n");
}

export function openSmsDraft(url) {
  if (!url) return;
  window.location.href = url;
}

export function sendContactTexts({ kind, context, coords } = {}) {
  const contacts = loadShelterContacts();
  const phones = uniqueContactPhones(contacts);
  if (!phones.length) {
    const error = new Error("Add at least one shelter contact first.");
    error.code = "NO_CONTACTS";
    throw error;
  }

  const maps = coords?.latitude && coords?.longitude
    ? `My location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
    : "(Location unavailable — GPS pin will be added next time location is on.)";

  const body =
    kind === "emergency"
      ? buildEmergencyBody({ locationLine: maps })
      : buildImSafeBody({ locationLine: maps, context });

  openSmsDraft(buildSmsUrl(phones, body));
  return { count: phones.length };
}
