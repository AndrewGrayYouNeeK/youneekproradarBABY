import { useQuery } from "@tanstack/react-query";
import { appHref, fetchSiteConfig, resolveSiteRole, siteRoleFromHost, weatherAppOrigin } from "@/lib/sites";

export default function useSiteConfig() {
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  const hostRole = siteRoleFromHost(hostname);
  const { data: site } = useQuery({
    queryKey: ["site-config"],
    queryFn: fetchSiteConfig,
    staleTime: 60000,
  });
  const role = resolveSiteRole(site?.role, hostname);
  return {
    role,
    hostRole,
    external: role === "landing" && Boolean(weatherAppOrigin(site)),
    weatherHref: appHref(site, "/Forecast"),
    mapsHref: appHref(site, "/Radar"),
    contactsHref: appHref(site, "/Contacts"),
  };
}
