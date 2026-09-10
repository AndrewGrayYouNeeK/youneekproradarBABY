import { useQuery } from "@tanstack/react-query";
import { fetchRainViewerCatalog } from "@/lib/api/rainviewer";

export default function useRainViewer() {
  return useQuery({
    queryKey: ["rainviewer-catalog"],
    queryFn: fetchRainViewerCatalog,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
