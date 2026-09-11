import { useQuery } from "@tanstack/react-query";
import { appHref, fetchSiteConfig, siteRoleFromHost, weatherAppOrigin } from "@/lib/sites";

export default function useSiteConfig() {
  const hostRole = siteRoleFromHost(typeof window === "undefined" ? "" : window.location.hostname);
  const { data: site } = useQuery({
    queryKey: ["site-config"],
    queryFn: fetchSiteConfig,
    staleTime: 60000,
  });
  return {
    role: hostRole,
    external: hostRole === "landing" && Boolean(weatherAppOrigin(site)),
    weatherHref: appHref(site, "/Forecast"),
    mapsHref: appHref(site, "/Radar"),
    contactsHref: appHref(site, "/Contacts"),
  };
}
