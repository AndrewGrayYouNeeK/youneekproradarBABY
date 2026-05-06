import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Main tab routes — going "back" from these never pops the stack;
// it routes to the canonical home tab instead.
const TAB_PATHS = ["/Radar", "/Forecast", "/Alerts", "/Radio", "/Safety"];
const HOME_PATH = "/Radar";

/**
 * Central navigation hook for consistent back-stack behavior.
 *
 *  - goBack(): pop history if there's a real entry to pop, otherwise
 *    fall back to the home tab. Avoids dead-ends when a route is
 *    deep-linked or the user enters mid-flow on mobile.
 *  - go(path): replace=true on tab routes (so tab switching doesn't
 *    bloat the back stack), push for everything else.
 *  - replace(path): forced replace.
 *  - reload(): full page reload (used after location changes).
 */
export default function useAppNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(() => {
    // window.history.length > 1 means there IS a previous entry in the
    // session history. On a fresh tab open it'll be 1.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(HOME_PATH, { replace: true });
    }
  }, [navigate]);

  const go = useCallback(
    (path, options = {}) => {
      const isTab = TAB_PATHS.includes(path);
      navigate(path, { replace: isTab, ...options });
    },
    [navigate]
  );

  const replace = useCallback(
    (path) => navigate(path, { replace: true }),
    [navigate]
  );

  const reload = useCallback(() => window.location.reload(), []);

  const isTab = TAB_PATHS.includes(location.pathname);

  return { goBack, go, replace, reload, isTab, pathname: location.pathname, TAB_PATHS, HOME_PATH };
}