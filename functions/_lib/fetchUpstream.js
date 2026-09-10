export async function fetchUpstream(url, { timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "YouNeeKProRadar/1.0 (https://youneek.com; andrew@youneek.com)",
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function jsonFrom(url) {
  const response = await fetchUpstream(url);
  if (!response.ok) {
    throw new Error(`Upstream ${response.status} for ${url}`);
  }
  return response.json();
}
