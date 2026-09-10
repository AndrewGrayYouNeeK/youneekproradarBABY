import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AccountActions from "./AccountActions";
import RadioControls from "./RadioControls";
import { MAP_LAYER_GROUPS, MAP_LAYERS } from "@/lib/weather/mapLayers";

function ToggleRow({ label, checked, onCheckedChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[13px] leading-tight text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel || label} />
    </div>
  );
}

export default function RadarLayersMenu({
  isOpen,
  onToggle,
  showNexrad,
  showRadio,
  alertToggles,
  onShowNexradChange,
  onShowRadioChange,
  onAlertToggleChange,
  activeLayerId,
  onLayerChange,
  viewMode,
  onViewModeChange,
}) {
  const [showAlerts, setShowAlerts] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div
      ref={menuRef}
      className="absolute z-[1000]"
      style={{ top: "calc(0.75rem + env(safe-area-inset-top))", right: "calc(0.75rem + env(safe-area-inset-right))" }}
    >
      {isOpen && (
        <div className="w-[min(20rem,calc(100vw-1.5rem))] max-h-[calc(100vh-7.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Layers</div>
            {onViewModeChange && (
              <button
                type="button"
                onClick={() => onViewModeChange(viewMode === "3d" ? "2d" : "3d")}
                className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-200"
              >
                {viewMode === "3d" ? "3D on" : "3D globe"}
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <ToggleRow
                label="Live overlay"
                checked={showNexrad}
                onCheckedChange={onShowNexradChange}
                ariaLabel="Toggle live weather overlay"
              />
            </div>

            {MAP_LAYER_GROUPS.map((group) => (
              <div key={group} className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{group}</div>
                <div className="flex flex-wrap gap-1.5">
                  {MAP_LAYERS.filter((layer) => layer.group === group).map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => onLayerChange?.(layer.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] ${
                        activeLayerId === layer.id ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-300"
                      }`}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <button
                type="button"
                onClick={() => setShowAlerts((value) => !value)}
                className="flex w-full items-center justify-between text-left"
                aria-label={showAlerts ? "Hide warning controls" : "Show warning controls"}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Warnings</div>
                {showAlerts ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              {showAlerts && (
                <div className="mt-2 space-y-2">
                  <ToggleRow label="Tornado Warnings" checked={alertToggles.tornado} onCheckedChange={(value) => onAlertToggleChange("tornado", value)} />
                  <ToggleRow label="Severe Thunderstorm" checked={alertToggles.severe} onCheckedChange={(value) => onAlertToggleChange("severe", value)} />
                  <ToggleRow label="Flood Warnings" checked={alertToggles.flood} onCheckedChange={(value) => onAlertToggleChange("flood", value)} />
                  <ToggleRow label="Winter Advisories" checked={alertToggles.winter} onCheckedChange={(value) => onAlertToggleChange("winter", value)} />
                </div>
              )}
            </div>

            <RadioControls showRadio={showRadio} onShowRadioChange={onShowRadioChange} />
            <AccountActions />
          </div>
        </div>
      )}
    </div>
  );
}
