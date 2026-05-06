import { NavLink } from "react-router-dom";
import { Radar, CloudSun, AlertTriangle, Radio, ShieldAlert } from "lucide-react";

const TABS = [
  { to: "/Radar", label: "Radar", icon: Radar },
  { to: "/Forecast", label: "Forecast", icon: CloudSun },
  { to: "/Alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/Radio", label: "Radio", icon: Radio },
  { to: "/Safety", label: "Safety", icon: ShieldAlert },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-4xl -translate-x-1/2 border-t border-border/60 glass-strong safe-bottom"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex h-7 w-7 items-center justify-center">
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-primary/30" />
                    )}
                    <Icon className="relative h-5 w-5" strokeWidth={isActive ? 2.4 : 2} aria-hidden />
                  </div>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}