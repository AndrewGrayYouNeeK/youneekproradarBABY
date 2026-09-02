import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AccountActions from "./AccountActions";
import RadioControls from "./RadioControls";
import RadarDataDock from "./RadarDataDock";
import TargetList from "./TargetList";

function ToggleRow({ label, checked, onCheckedChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
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
  showLightning,
  showHurricanes,
  showSatellite,
  alertToggles,
  onShowNexradChange,
  onShowRadioChange,
  onShowLightningChange,
  onShowHurricanesChange,
  onShowSatelliteChange,
  onAlertToggleChange,
  onResetView,
  metrics,
  station,
  targets = [],
  onTargetClick,
  onDeleteTarget,
}) {
  const [showAlerts, setShowAlerts] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[2000]">
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-black/55"
        aria-label="Close map layers"
        onClick={onToggle}
      />
      <div
        className="pointer-events-auto absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-[1.6rem] border-t border-white/10 bg-[#10151c] shadow-[0_-18px_50px_rgba(0,0,0,0.55)]"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        role="dialog"
        aria-label="Map layers"
      >
        <div className="sticky top-0 z-10 bg-[#10151c] px-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-400">
                Weather overlay
              </div>
              <h2 className="text-lg font-semibold text-white">Map layers</h2>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Close map layers"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-2">
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Radar</div>
            <ToggleRow
              label="Live NEXRAD"
              checked={showNexrad}
              onCheckedChange={onShowNexradChange}
              ariaLabel="Toggle live NEXRAD radar layer"
            />
            <ToggleRow
              label="Satellite"
              checked={showSatellite}
              onCheckedChange={onShowSatelliteChange}
              ariaLabel="Toggle satellite layer"
            />
            <ToggleRow
              label="Lightning"
              checked={showLightning}
              onCheckedChange={onShowLightningChange}
              ariaLabel="Toggle lightning reports"
            />
            <ToggleRow
              label="Tropical cyclones"
              checked={showHurricanes}
              onCheckedChange={onShowHurricanesChange}
              ariaLabel="Toggle tropical cyclone markers"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
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
                <ToggleRow
                  label="Tornado warnings"
                  checked={alertToggles.tornado}
                  onCheckedChange={(value) => onAlertToggleChange("tornado", value)}
                  ariaLabel="Toggle tornado warnings layer"
                />
                <ToggleRow
                  label="Severe thunderstorm"
                  checked={alertToggles.severe}
                  onCheckedChange={(value) => onAlertToggleChange("severe", value)}
                  ariaLabel="Toggle severe thunderstorm warnings layer"
                />
                <ToggleRow
                  label="Flood warnings"
                  checked={alertToggles.flood}
                  onCheckedChange={(value) => onAlertToggleChange("flood", value)}
                  ariaLabel="Toggle flood warnings layer"
                />
                <ToggleRow
                  label="Winter advisories"
                  checked={alertToggles.winter}
                  onCheckedChange={(value) => onAlertToggleChange("winter", value)}
                  ariaLabel="Toggle winter advisories layer"
                />
              </div>
            )}
          </div>

          <RadioControls showRadio={showRadio} onShowRadioChange={onShowRadioChange} />

          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Tools</div>
            <button
              type="button"
              onClick={onResetView}
              className="flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10"
            >
              Reset to national view
            </button>
            <RadarDataDock metrics={metrics} station={station} />
            <TargetList
              targets={targets}
              onTargetClick={onTargetClick}
              onDeleteTarget={onDeleteTarget}
            />
            <AccountActions variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
}
