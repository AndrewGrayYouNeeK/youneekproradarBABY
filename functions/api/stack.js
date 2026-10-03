import { buildStackResponse } from "../_lib/stack/snapshot.js";

function stackJson(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function onRequestGet({ request, env }) {
  const result = await buildStackResponse(request, env);
  return stackJson(result.body, result.status);
}
