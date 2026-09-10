import { jsonFrom } from "../_lib/fetchUpstream.js";

const NIFC_URL =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?where=IncidentSize%3E0&outFields=IncidentName,PercentContained,IncidentSize,FireDiscoveryDateTime,POOState,POOCounty,TotalIncidentPersonnel,FireCause,IncidentTypeCategory,UniqueFireIdentifier&orderByFields=IncidentSize%20DESC&resultRecordCount=250&outSR=4326&f=geojson";

export async function onRequestGet() {
  try {
    const data = await jsonFrom(NIFC_URL);
    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (err) {
    return Response.json(
      { type: "FeatureCollection", features: [], error: err.message || "Fire request failed" },
      { status: 502 }
    );
  }
}
