import { useQuery } from "@tanstack/react-query";
import { fetchActiveFires, fetchLightning, fetchNhcStorms, fetchSpcOutlook } from "@/lib/api/live";

export function useNhcStorms() {
  return useQuery({
    queryKey: ["nhc-storms"],
    queryFn: fetchNhcStorms,
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useActiveFires() {
  return useQuery({
    queryKey: ["active-fires"],
    queryFn: fetchActiveFires,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export function useSpcOutlook() {
  return useQuery({
    queryKey: ["spc-outlook"],
    queryFn: fetchSpcOutlook,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

export function useLightning() {
  return useQuery({
    queryKey: ["lightning-strikes"],
    queryFn: fetchLightning,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
