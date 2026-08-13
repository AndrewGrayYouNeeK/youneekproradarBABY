const CLICKJACKING_HEADERS = {
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
};

export async function onRequest(context) {
  const response = await context.next();
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(CLICKJACKING_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
