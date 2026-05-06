import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const SETTINGS_KEY = ["app_settings"];

const DEFAULTS = {
  units: "imperial",
  notifyAlerts: true,
  notifySevere: true,
  autoTune: true,
};

const STORAGE_KEYS = {
  units: "pref_units",
  notifyAlerts: "pref_notifyAlerts",
  notifySevere: "pref_notifySevere",
  autoTune: "pref_autoTune",
};

function loadSettings() {
  return {
    units: localStorage.getItem(STORAGE_KEYS.units) || DEFAULTS.units,
    notifyAlerts: localStorage.getItem(STORAGE_KEYS.notifyAlerts) !== "false",
    notifySevere: localStorage.getItem(STORAGE_KEYS.notifySevere) !== "false",
    autoTune: localStorage.getItem(STORAGE_KEYS.autoTune) !== "false",
  };
}

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: loadSettings,
    staleTime: Infinity,
    initialData: loadSettings,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }) => ({ key, value }),
    onMutate: async ({ key, value }) => {
      await qc.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = qc.getQueryData(SETTINGS_KEY) || loadSettings();
      qc.setQueryData(SETTINGS_KEY, { ...previous, [key]: value });
      return { previous };
    },
    onSuccess: ({ key, value }) => {
      const storageKey = STORAGE_KEYS[key];
      if (storageKey) localStorage.setItem(storageKey, String(value));
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(SETTINGS_KEY, ctx.previous);
    },
  });
}