import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Map as MapIcon, Eye, X, Check } from "lucide-react";
import { RADAR_LAYERS, BASEMAP_STYLES } from "./RadarMap";

export default function RadarControls({
  radarLayer,
  setRadarLayer,
  basemap,
  setBasemap,
  radarOpacity,
  setRadarOpacity,
}) {
  const [open, setOpen] = useState(null); // 'layers' | 'basemap' | null

  return (
    <>
      <div className="absolute right-3 top-32 z-20 flex flex-col gap-2.5">
        <ControlBtn icon={Layers} label="Layers" active={open === "layers"} onClick={() => setOpen(open === "layers" ? null : "layers")} />
        <ControlBtn icon={MapIcon} label="Map" active={open === "basemap"} onClick={() => setOpen(open === "basemap" ? null : "basemap")} />
      </div>

      <AnimatePresence>
        {open === "layers" && (
          <Panel title="Radar Layer" onClose={() => setOpen(null)}>
            {Object.entries(RADAR_LAYERS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setRadarLayer(key); setOpen(null); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  radarLayer === key ? "bg-primary/15 text-primary" : "hover:bg-secondary"
                }`}
              >
                <div>
                  <div className="font-medium">{val.name}</div>
                  <div className="text-[11px] text-muted-foreground">{val.desc}</div>
                </div>
                {radarLayer === key && <Check className="h-4 w-4" />}
              </button>
            ))}
            <div className="mt-3 border-t border-border/60 pt-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Eye className="h-3 w-3" /> Opacity
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={radarOpacity}
                onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                className="w-full accent-primary"
                style={{ minHeight: "auto" }}
              />
            </div>
          </Panel>
        )}
        {open === "basemap" && (
          <Panel title="Base Map" onClose={() => setOpen(null)}>
            {Object.entries(BASEMAP_STYLES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setBasemap(key); setOpen(null); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  basemap === key ? "bg-primary/15 text-primary" : "hover:bg-secondary"
                }`}
              >
                <span className="font-medium">{val.name}</span>
                {basemap === key && <Check className="h-4 w-4" />}
              </button>
            ))}
          </Panel>
        )}
      </AnimatePresence>
    </>
  );
}

function ControlBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 glass-strong transition-colors ${
        active ? "border-primary/60 text-primary" : "text-foreground hover:bg-secondary"
      }`}
      style={{ minHeight: "auto" }}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function Panel({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.18 }}
      className="absolute right-16 top-32 z-20 w-64 rounded-2xl border border-border/60 glass-strong p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
        <button onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary" style={{ minHeight: "auto" }}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </motion.div>
  );
}