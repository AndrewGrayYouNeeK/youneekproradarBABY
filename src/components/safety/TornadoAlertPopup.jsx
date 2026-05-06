import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import useLocation from "@/hooks/useLocation";
import { fetchActiveAlerts } from "@/lib/weather/api";
import { AlertTriangle, ShieldCheck, X } from "lucide-react";

// Global popup that appears whenever a Tornado/Severe warning is active.
// User can dismiss per-event; reappears if a new event arrives.
const DISMISS_KEY = "dismissed_alert_ids_v1";

const isCriticalEvent = (event = "") => {
  const e = event.toLowerCase();
  return (
    e.includes("tornado warning") ||
    e.includes("tornado emergency") ||
    e.includes("flash flood emergency") ||
    e.includes("hurricane warning")
  );
};

const getDismissed = () => {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]")); }
  catch { return new Set(); }
};
const addDismissed = (id) => {
  const s = getDismissed();
  s.add(id);
  // Keep last 50 only
  const arr = Array.from(s).slice(-50);
  localStorage.setItem(DISMISS_KEY, JSON.stringify(arr));
};

export default function TornadoAlertPopup() {
  const { location } = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(getDismissed);

  const { data } = useQuery({
    queryKey: ["alerts-popup", location.latitude, location.longitude],
    queryFn: () => fetchActiveAlerts(location.latitude, location.longitude),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });

  const critical = (data?.features || []).find((f) => {
    const id = f.id || f.properties?.id;
    return isCriticalEvent(f.properties?.event) && !dismissed.has(id);
  });

  // Vibrate on first appearance (mobile)
  useEffect(() => {
    if (critical && navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 300]);
    }
  }, [critical?.id]);

  if (!critical) return null;

  const id = critical.id || critical.properties?.id;
  const event = critical.properties?.event || "Severe Warning";
  const area = critical.properties?.areaDesc || "";

  const handleDismiss = () => {
    addDismissed(id);
    setDismissed(new Set([...dismissed, id]));
  };

  const handleSafetyTap = () => {
    addDismissed(id);
    setDismissed(new Set([...dismissed, id]));
    navigate("/Safety");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24 }}
          className="relative w-full max-w-md rounded-t-3xl border-t-2 border-red-500 bg-gradient-to-b from-red-950 to-card p-5 shadow-2xl sm:rounded-3xl sm:border-2 safe-bottom"
        >
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-red-200 hover:bg-red-900/40"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-300">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            Take Shelter Now
          </div>

          <h2 className="mt-2 text-2xl font-black leading-tight text-red-100">
            {event}
          </h2>
          <p className="mt-1 text-sm text-red-200/80 line-clamp-3">{area}</p>

          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/40 p-3 text-xs leading-relaxed text-red-100/90">
            <strong className="block text-red-50">If indoors:</strong>
            Go to a basement, storm shelter, or interior room on the lowest floor. Stay away from windows.
          </div>

          <button
            onClick={handleSafetyTap}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 text-base font-bold text-emerald-950 shadow-lg shadow-emerald-500/30 transition-transform active:scale-[0.98]"
          >
            <ShieldCheck className="h-5 w-5" />
            Send "I'm Safe" Text
          </button>

          <button
            onClick={handleDismiss}
            className="mt-2 w-full rounded-2xl border border-red-500/40 bg-transparent py-3 text-sm font-semibold text-red-200"
          >
            Dismiss
          </button>

          <p className="mt-3 text-center text-[10px] text-red-300/70">
            Source: National Weather Service · {new Date().toLocaleTimeString()}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}