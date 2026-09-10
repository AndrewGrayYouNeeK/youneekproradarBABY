export async function fetchNhcStorms() {
  const response = await fetch("/api/storms");
  if (!response.ok) {
    const fallback = await fetch("/api/nhc");
    if (!fallback.ok) throw new Error("Hurricane feed failed");
    return fallback.json();
  }
  return response.json();
}

export async function fetchActiveFires() {
  const response = await fetch("/api/fires");
  if (!response.ok) throw new Error("Fire feed failed");
  return response.json();
}

export async function fetchSpcOutlook() {
  const response = await fetch("/api/spc");
  if (!response.ok) throw new Error("SPC outlook failed");
  return response.json();
}

export async function fetchLightning() {
  const response = await fetch("/api/lightning");
  if (!response.ok) throw new Error("Lightning feed failed");
  return response.json();
}

export function stormClassLabel(code) {
  const map = {
    TD: "Tropical Depression",
    TS: "Tropical Storm",
    HU: "Hurricane",
    MH: "Major Hurricane",
    PT: "Potential Tropical Cyclone",
    SD: "Subtropical Depression",
    SS: "Subtropical Storm",
    LO: "Low",
    DB: "Disturbance",
    EX: "Extratropical",
  };
  return map[code] || code || "Tropical cyclone";
}

export function stormCategory(knots) {
  const k = Number(knots);
  if (!Number.isFinite(k)) return "—";
  if (k >= 137) return "Cat 5";
  if (k >= 113) return "Cat 4";
  if (k >= 96) return "Cat 3";
  if (k >= 83) return "Cat 2";
  if (k >= 64) return "Cat 1";
  if (k >= 34) return "Tropical Storm";
  return "Depression";
}
