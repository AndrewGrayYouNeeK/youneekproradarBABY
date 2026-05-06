import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import { Switch } from "@/components/ui/switch";
import {
  ChevronRight, Radio, Bell, Shield, Info, Trash2, AlertTriangle,
  Users, MapPin, Thermometer
} from "lucide-react";

const APP_VERSION = "1.0.0";

function Section({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
      <div className="border-b border-border/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className="divide-y divide-border/40">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sublabel, right, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        onClick ? "hover:bg-secondary/50 active:bg-secondary" : "cursor-default"
      } ${danger ? "text-red-300" : ""}`}
    >
      {Icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-950/40" : "bg-secondary"}`}>
          <Icon className={`h-4 w-4 ${danger ? "text-red-400" : "text-primary"}`} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-tight">{label}</div>
        {sublabel && <div className="mt-0.5 text-xs text-muted-foreground leading-snug">{sublabel}</div>}
      </div>
      {right !== undefined ? (
        <div className="shrink-0">{right}</div>
      ) : onClick ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : null}
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [units, setUnits] = useState(() => localStorage.getItem("pref_units") || "imperial");
  const [notifyAlerts, setNotifyAlerts] = useState(() => localStorage.getItem("pref_notifyAlerts") !== "false");
  const [notifySevere, setNotifySevere] = useState(() => localStorage.getItem("pref_notifySevere") !== "false");
  const [autoTune, setAutoTune] = useState(() => localStorage.getItem("pref_autoTune") !== "false");
  const [showAbout, setShowAbout] = useState(false);

  const setPref = (key, setter) => (val) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const me = await base44.auth.me();
      await base44.entities.User.delete(me.id);
      await base44.auth.logout("/");
    },
    onMutate: () => setConfirmingDelete(false),
  });

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader title="Settings" />

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <Section title="Notifications">
          <Row
            icon={Bell}
            label="Weather alerts"
            sublabel="NWS active alerts for your location"
            right={<Switch checked={notifyAlerts} onCheckedChange={setPref("pref_notifyAlerts", setNotifyAlerts)} />}
          />
          <Row
            icon={AlertTriangle}
            label="Severe weather"
            sublabel="Tornado, hurricane, flash flood warnings"
            right={<Switch checked={notifySevere} onCheckedChange={setPref("pref_notifySevere", setNotifySevere)} />}
          />
        </Section>

        <Section title="Units">
          <Row
            icon={Thermometer}
            label="Measurement system"
            sublabel={units === "imperial" ? "°F · mph · inches" : "°C · km/h · mm"}
            right={
              <div className="flex rounded-xl border border-border/60 bg-secondary/40 p-0.5">
                <button
                  onClick={() => { setUnits("imperial"); localStorage.setItem("pref_units", "imperial"); }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${units === "imperial" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  style={{ minHeight: "auto" }}
                >
                  °F
                </button>
                <button
                  onClick={() => { setUnits("metric"); localStorage.setItem("pref_units", "metric"); }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${units === "metric" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  style={{ minHeight: "auto" }}
                >
                  °C
                </button>
              </div>
            }
          />
        </Section>

        <Section title="NOAA Radio">
          <Row
            icon={Radio}
            label="Auto-tune nearest station"
            sublabel="Pick the closest NOAA broadcast on launch"
            right={<Switch checked={autoTune} onCheckedChange={setPref("pref_autoTune", setAutoTune)} />}
          />
        </Section>

        <Section title="Account">
          <Row icon={Users} label="Safety Contacts" sublabel="Manage trusted recipients" onClick={() => navigate("/Contacts")} />
          <Row
            icon={MapPin}
            label="Reset saved location"
            sublabel="Use device GPS again on next launch"
            onClick={() => {
              localStorage.removeItem("user_location_v1");
              window.location.reload();
            }}
          />
        </Section>

        <Section title="About">
          <Row
            icon={Info}
            label="YouNeeK Pro Radar"
            sublabel={`Version ${APP_VERSION}`}
            onClick={() => setShowAbout((v) => !v)}
            right={<ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showAbout ? "rotate-90" : ""}`} />}
          />
          {showAbout && (
            <div className="space-y-2 px-4 pb-4 pt-1 text-xs leading-relaxed text-muted-foreground">
              <p>
                Real-time NEXRAD radar from Iowa Environmental Mesonet. National Weather Service active alerts.
                NOAA Weather Radio with auto-tuning. Lightning strikes, severe weather warnings, hourly + 7-day
                forecasts, air quality, and one-tap "I'm Safe" check-ins.
              </p>
              <p>Data: Iowa Mesonet · api.weather.gov · open-meteo.com</p>
              <p>© 2026 YouNeeK</p>
            </div>
          )}
          <Row icon={Shield} label="Privacy" sublabel="All data stays on your device" right={null} />
        </Section>

        <Section title="Danger Zone">
          {!confirmingDelete ? (
            <Row
              icon={Trash2}
              label="Delete account"
              sublabel="Permanently removes your account and data"
              onClick={() => setConfirmingDelete(true)}
              danger
            />
          ) : (
            <div className="space-y-3 p-4">
              <p className="text-sm text-red-200 leading-snug">
                This permanently deletes your account. There's no going back.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 rounded-xl border border-border/60 bg-secondary/40 px-3 py-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAccountMutation.mutate()}
                  disabled={deleteAccountMutation.isPending}
                  className="flex-1 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {deleteAccountMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>

      <BottomNav />
    </div>
  );
}