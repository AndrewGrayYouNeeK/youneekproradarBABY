import { Activity, CloudSun, Compass, Globe2, Settings, Layers } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigationStack } from "@/lib/NavigationStack";

const TABS = [
  { label: "Radar", path: "/Radar", icon: Activity },
  { label: "Globe", path: "/Globe", icon: Globe2 },
  { label: "Forecast", path: "/Forecast", icon: CloudSun },
  { label: "Explore", path: "/Explore", icon: Compass },
  { label: "Settings", path: "/Settings", icon: Settings },
];

export default function BottomTab({ onToolsClick, showTools }) {
  const location = useLocation();
  const { navigateToTab, resetTab } = useNavigationStack();
  const isRadarPage = location.pathname === "/Radar" || location.pathname === "/";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[1800] select-none border-t border-white/10 bg-slate-950/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1.5">
        {TABS.map(({ label, path, icon: Icon }) => {
          const active =
            location.pathname === path ||
            (label === "Radar" && location.pathname === "/") ||
            (label === "Explore" && location.pathname === "/Storms") ||
            (label === "Settings" && location.pathname === "/Contacts");
          return (
            <button
              key={path}
              type="button"
              onClick={() => {
                if (active) {
                  resetTab(label);
                } else {
                  navigateToTab(label);
                }
              }}
              aria-label={`Open ${label}`}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
        {isRadarPage && (
          <button
            type="button"
            onClick={onToolsClick}
            aria-label="Open radar tools"
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-medium transition-colors ${
              showTools ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="h-5 w-5" aria-hidden="true" />
            <span>Tools</span>
          </button>
        )}
      </div>
    </div>
  );
}
