import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSavedLocations, addSavedLocation, removeSavedLocation,
} from "@/lib/weather/savedLocations";

const LOCATIONS_KEY = ["saved_locations"];

export function useSavedLocations() {
  return useQuery({
    queryKey: LOCATIONS_KEY,
    queryFn: () => getSavedLocations(),
    staleTime: Infinity,
  });
}

export function useAddLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loc) => loc,
    onMutate: async (loc) => {
      await qc.cancelQueries({ queryKey: LOCATIONS_KEY });
      const previous = qc.getQueryData(LOCATIONS_KEY) || [];
      // skip if a location with the same label already exists
      if (previous.some((l) => l.label === loc.label)) return { previous, skipped: true };
      const optimistic = [...previous, { ...loc, id: `tmp-${Date.now()}` }];
      qc.setQueryData(LOCATIONS_KEY, optimistic);
      return { previous };
    },
    onSuccess: (loc, _vars, ctx) => {
      if (ctx?.skipped) return;
      const persisted = addSavedLocation(loc);
      qc.setQueryData(LOCATIONS_KEY, persisted);
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(LOCATIONS_KEY, ctx.previous);
    },
  });
}

export function useRemoveLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => id,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: LOCATIONS_KEY });
      const previous = qc.getQueryData(LOCATIONS_KEY) || [];
      qc.setQueryData(LOCATIONS_KEY, previous.filter((l) => l.id !== id));
      return { previous };
    },
    onSuccess: (id) => {
      const persisted = removeSavedLocation(id);
      qc.setQueryData(LOCATIONS_KEY, persisted);
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(LOCATIONS_KEY, ctx.previous);
    },
  });
}