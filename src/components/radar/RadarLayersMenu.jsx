import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Pin, PinOff, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AccountActions from "./AccountActions";
import RadioControls from "./RadioControls";
import RadarDataDock from "./RadarDataDock";
import TargetList from "./TargetList";
import { MAP_FEATURE_GROUPS, MAP_FEATURES, MAX_DOCK_CHIPS } from "@/lib/mapDesk";

function ToggleRow({ label, checked, onCheckedChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-[13px] leading-tight text-white">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel || label}
        className="data-[state=checked]:bg-lime-400"
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      {children}
    </div>
  );
}

export default function RadarLayersMenu({
  isOpen,
  onToggle,
  showNexrad,
  showLightning,
  showHurricanes,
  showSatellite,
  loopEnabled,
  alertToggles,
  onShowNexradChange,
  onShowLightningChange,
  onShowHurricanesChange,
  onShowSatelliteChange,
  onToggleLoop,
  onAlertToggleChange,
  radarOpacity = 0.8,
  onRadarOpacityChange,
  onResetView,
  onFeatureAction,
  dockIds = [],
  onTogglePin,
  onMovePin,
  onResetDock,
  metrics,
  station,
  targets = [],
  onTargetClick,
  onDeleteTarget,
}) {
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);

  if (!isOpen) return null;

  const openRoute = (path) => {
    onToggle();
    navigate(path);
  };

  const runAction = (id) => {
    onToggle();
    onFeatureAction?.(id);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[2000]">
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-black/55"
        aria-label="Close map layers"
        onClick={onToggle}
      />
      <div
        className="pointer-events-auto absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-[1.6rem] border-t border-white/10 bg-[#10151c] shadow-[0_-18px_50px_rgba(0,0,0,0.55)]"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        role="dialog"
        aria-label="Map desk"
      >
        <div className="sticky top-0 z-10 bg-[#10151c] px-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-400">
                Pro desk
              </div>
              <h2 className="text-lg font-semibold text-white">Map layers & tools</h2>
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
          <Section title="Map overlays">
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
            <ToggleRow
              label="Radar loop"
              checked={loopEnabled}
              onCheckedChange={() => onToggleLoop?.()}
              ariaLabel="Toggle radar loop"
            />
            <div className="pt-1">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Layer opacity</span>
                <span>{Math.round(radarOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={Math.round(radarOpacity * 100)}
                onChange={(event) => onRadarOpacityChange?.(Number(event.target.value) / 100)}
                aria-label="Radar layer opacity"
                className="radar-timeline w-full"
              />
            </div>
          </Section>

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

          <Section title="Pro desk">
            <p className="text-[11px] leading-relaxed text-slate-500">
              Every tool opens from this map. Pin favorites to the bottom bar.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MAP_FEATURES.filter((feature) => feature.kind === "route").map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openRoute(item.path)}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => runAction("help")}
                className="flex min-h-11 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white"
              >
                Help Me
              </button>
              <button
                type="button"
                onClick={() => runAction("safe")}
                className="flex min-h-11 items-center justify-center rounded-xl bg-lime-400 text-sm font-bold text-zinc-950"
              >
                I&apos;m Safe
              </button>
            </div>
          </Section>

          <RadioControls />

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <button
              type="button"
              onClick={() => setShowCustomize((value) => !value)}
              className="flex w-full items-center justify-between text-left"
              aria-label={showCustomize ? "Hide map shortcuts" : "Customize map shortcuts"}
            >
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">On the map</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {dockIds.length}/{MAX_DOCK_CHIPS} shortcuts pinned
                </div>
              </div>
              {showCustomize ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {showCustomize && (
              <div className="mt-3 space-y-3">
                {MAP_FEATURE_GROUPS.map((group) => (
                  <div key={group.id}>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</div>
                    <div className="space-y-1">
                      {MAP_FEATURES.filter((feature) => feature.group === group.id).map((feature) => {
                        const pinned = dockIds.includes(feature.id);
                        const index = dockIds.indexOf(feature.id);
                        return (
                          <div key={feature.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1.5">
                            <div className="min-w-0 flex-1 text-sm text-white">{feature.label}</div>
                            {pinned && (
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  aria-label={`Move ${feature.label} left`}
                                  onClick={() => onMovePin(feature.id, -1)}
                                  disabled={index <= 0}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 disabled:opacity-30"
                                >
                                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Move ${feature.label} right`}
                                  onClick={() => onMovePin(feature.id, 1)}
                                  disabled={index < 0 || index >= dockIds.length - 1}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 disabled:opacity-30"
                                >
                                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => onTogglePin(feature.id)}
                              disabled={!pinned && dockIds.length >= MAX_DOCK_CHIPS}
                              aria-label={pinned ? `Unpin ${feature.label}` : `Pin ${feature.label} to map`}
                              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold disabled:opacity-30 ${
                                pinned ? "bg-lime-400 text-zinc-950" : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {pinned ? <Pin className="h-3.5 w-3.5" aria-hidden="true" /> : <PinOff className="h-3.5 w-3.5" aria-hidden="true" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={onResetDock}
                  className="flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                >
                  Reset shortcuts
                </button>
              </div>
            )}
          </div>

          <Section title="Tools">
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
          </Section>
        </div>
      </div>
    </div>
  );
}
