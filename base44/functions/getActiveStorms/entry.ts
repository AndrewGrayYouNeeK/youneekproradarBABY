// Fetches NOAA NHC active tropical cyclones (server-side to bypass CORS).
Deno.serve(async () => {
  try {
    const res = await fetch("https://www.nhc.noaa.gov/CurrentStorms.json", {
      headers: { "User-Agent": "YouNeeKProRadar/1.0" },
    });
    if (!res.ok) {
      return Response.json({ activeStorms: [], error: `NHC ${res.status}` }, { status: 200 });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ activeStorms: [], error: err.message }, { status: 200 });
  }
});