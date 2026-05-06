import { useState } from "react";
import { ChevronDown, AlertTriangle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { alertSeverity } from "@/lib/weather/api";

const TIER_STYLE = {
  extreme: "border-red-500/60 bg-red-950/40 text-red-100",
  severe: "border-orange-500/60 bg-orange-950/40 text-orange-100",
  warning: "border-yellow-500/50 bg-yellow-950/30 text-yellow-100",
  watch: "border-amber-500/50 bg-amber-950/30 text-amber-100",
  advisory: "border-cyan-500/40 bg-cyan-950/30 text-cyan-100",
  info: "border-border bg-card text-foreground",
};

const TIER_BADGE = {
  extreme: "bg-red-500 text-white",
  severe: "bg-orange-500 text-white",
  warning: "bg-yellow-500 text-black",
  watch: "bg-amber-500 text-black",
  advisory: "bg-cyan-500 text-black",
  info: "bg-secondary text-foreground",
};

export default function AlertCard({ alert }) {
  const [open, setOpen] = useState(false);
  const props = alert.properties || {};
  const sev = alertSeverity(props.event);
  const expires = props.expires ? new Date(props.expires) : null;

  return (
    <div className={`overflow-hidden rounded-2xl border ${TIER_STYLE[sev.tier]}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/30">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TIER_BADGE[sev.tier]}`}>
              {sev.tier}
            </span>
            <span className="truncate text-sm font-semibold">{props.event}</span>
          </div>
          <div className="mt-1 truncate text-xs opacity-80">{props.areaDesc}</div>
          {expires && (
            <div className="mt-1 flex items-center gap-1 text-[11px] opacity-70">
              <Clock className="h-3 w-3" />
              Until {expires.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}
            </div>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-current/20"
          >
            <div className="space-y-2 px-4 py-3 text-xs leading-relaxed">
              {props.headline && <div className="font-semibold">{props.headline}</div>}
              {props.description && <p className="whitespace-pre-line opacity-90">{props.description}</p>}
              {props.instruction && (
                <div className="mt-2 rounded-lg bg-black/30 p-2.5">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-80">Instructions</div>
                  <p className="whitespace-pre-line opacity-90">{props.instruction}</p>
                </div>
              )}
              {props.senderName && <div className="text-[10px] opacity-60">Issued by {props.senderName}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}