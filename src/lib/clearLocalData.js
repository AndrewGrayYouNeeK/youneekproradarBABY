const APP_STORAGE_KEYS = [
  "user_location_v1",
  "saved_locations_v1",
  "safety_contacts_v1",
  "safety_message_v1",
  "safety_safe_message_v1",
  "shelterContacts_v2",
  "shelterContacts",
  "pref_units",
  "pref_notifyAlerts",
  "pref_notifySevere",
  "pref_autoTune",
  "yk_onboarding_v1_seen",
  "dismissed_alert_ids_v1",
  "safety_last_tornado_end_v1",
];

export function clearLocalData() {
  APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
