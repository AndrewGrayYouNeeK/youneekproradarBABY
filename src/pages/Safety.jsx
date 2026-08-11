import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import useLocation from "@/hooks/useLocation";
import {
  loadContacts,
  loadMessage,
  saveMessage,
  loadSafeMessage,
  saveSafeMessage,
  buildSmsHref,
  formatDisplay,
  DEFAULT_MESSAGE,
  DEFAULT_SAFE_MESSAGE,
} from "@/lib/safety/contactsStore";
import { fetchActiveAlerts } from "@/lib/weather/api";
import { evaluateTornadoWindow } from "@/lib/safety/tornadoWindow";
import {
  Users,
  MapPin,
  Edit3,
  Check,
  AlertTriangle,
  Send,
  LifeBuoy,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function Safety() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [contacts, setContacts] = useState(loadContacts);
  const [helpMsg, setHelpMsg] = useState(loadMessage);
  const [safeMsg, setSafeMsg] = useState(loadSafeMessage);
  const [editing, setEditing] = useState(null); // 'help' | 'safe' | null
  const [draftMsg, setDraftMsg] = useState("");
  const [confirmMode, setConfirmMode] = useState(null); // 'help' | 'safe' | null
  const [sentInfo, setSentInfo] = useState(null); // { mode, time }

  // Refresh contacts when window regains focus (e.g. after editing on Contacts page)
  useEffect(() => {
    const refresh = () => setContacts(loadContacts());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const { data: alertData } = useQuery({
    queryKey: ["alerts", location.latitude, location.longitude],
    queryFn: () => fetchActiveAlerts(location.latitude, location.longitude),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  });

  // Re-evaluate window on a 60s tick so post-window expiry takes effect even if
  // alerts feed hasn't refetched.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const tornado = useMemo(
    () => evaluateTornadoWindow(alertData?.features),
    [alertData] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const canSend = tornado.canSend;

  const startEdit = (mode) => {
    setEditing(mode);
    setDraftMsg(mode === "help" ? helpMsg : safeMsg);
  };

  const saveEdit = () => {
    const next = draftMsg.trim() || (editing === "help" ? DEFAULT_MESSAGE : DEFAULT_SAFE_MESSAGE);
    if (editing === "help") {
      saveMessage(next);
      setHelpMsg(next);
    } else {
      saveSafeMessage(next);
      setSafeMsg(next);
    }
    setEditing(null);
  };

  const handleSend = (mode) => {
    if (!canSend) return;
    if (contacts.length === 0) {
      navigate("/Contacts");
      return;
    }
    setConfirmMode(mode);
  };

  const handleConfirmSend = () => {
    const numbers = contacts.map((c) => c.phone);
    const message = confirmMode === "help" ? helpMsg : safeMsg;
    const href = buildSmsHref(numbers, message, location);
    setSentInfo({ mode: confirmMode, time: new Date() });
    setConfirmMode(null);
    window.location.href = href;
  };

  return (
    <div className="relative h-full overflow-y-auto bg-background">
      <AppHeader
        title="Safety"
        location={location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
      />

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-32">
        <StatusBanner tornado={tornado} />

        {/* SOS card with both buttons */}
        <div className="overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-500/15 via-card to-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Emergency SOS
          </div>
          <p className="mt-2 text-sm text-foreground/80">
            During a tornado warning (and for a few hours after it ends), you can text your trusted contacts your live
            location with one tap. Opens your phone's messaging app — nothing sends automatically.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSend("help")}
              disabled={!canSend}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-red-500 px-3 py-4 text-white shadow-lg shadow-red-500/30 transition-transform active:scale-[0.98] hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-500/30 disabled:text-white/60 disabled:shadow-none"
            >
              <LifeBuoy className="h-5 w-5" />
              <span className="text-sm font-bold">Help Me</span>
            </button>
            <button
              onClick={() => handleSend("safe")}
              disabled={!canSend}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-500 px-3 py-4 text-white shadow-lg shadow-emerald-500/30 transition-transform active:scale-[0.98] hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-500/30 disabled:text-white/60 disabled:shadow-none"
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-bold">I'm Safe</span>
            </button>
          </div>

          {!canSend && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5 text-[11px] text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Locked. These buttons unlock during an active tornado warning and stay available for 3 hours after
                the warning ends.
              </span>
            </div>
          )}

          {sentInfo && (
            <div className={`mt-3 flex items-center gap-2 text-xs ${sentInfo.mode === "help" ? "text-red-300" : "text-emerald-300"}`}>
              <Check className="h-3.5 w-3.5" />
              {sentInfo.mode === "help" ? "Help message" : "Safe message"} opened at{" "}
              {sentInfo.time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </div>
          )}
        </div>

        {/* Recipients */}
        <button
          onClick={() => navigate("/Contacts")}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-4 text-left transition-colors hover:bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Recipients</div>
            <div className="truncate text-xs text-muted-foreground">
              {contacts.length === 0 ? "No contacts added yet" : contacts.map((c) => c.name).join(", ")}
            </div>
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold tabular-nums">
            {contacts.length}
          </span>
        </button>

        {/* Help message editor */}
        <MessageCard
          icon={LifeBuoy}
          accent="text-red-400"
          title={`"Help Me" message`}
          message={helpMsg}
          editing={editing === "help"}
          draft={draftMsg}
          onStartEdit={() => startEdit("help")}
          onChangeDraft={setDraftMsg}
          onSave={saveEdit}
        />

        {/* Safe message editor */}
        <MessageCard
          icon={ShieldCheck}
          accent="text-emerald-400"
          title={`"I'm Safe" message`}
          message={safeMsg}
          editing={editing === "safe"}
          draft={draftMsg}
          onStartEdit={() => startEdit("safe")}
          onChangeDraft={setDraftMsg}
          onSave={saveEdit}
        />

        <div className="flex items-center gap-2 rounded-xl bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          A Google Maps link to your current location is automatically appended to both messages.
        </div>

        <p className="px-2 pt-2 text-center text-[11px] text-muted-foreground">
          🔒 Contacts and location stay on this device. Nothing is shared until you tap send.
        </p>
      </div>

      {confirmMode && (
        <ConfirmSend
          mode={confirmMode}
          contacts={contacts}
          message={confirmMode === "help" ? helpMsg : safeMsg}
          location={location}
          onConfirm={handleConfirmSend}
          onCancel={() => setConfirmMode(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}

function StatusBanner({ tornado }) {
  if (tornado.active) {
    return (
      <div className="rounded-2xl border border-red-500/60 bg-red-950/40 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-300">Active Tornado Warning</div>
            <div className="mt-0.5 truncate text-sm font-semibold text-red-100">
              {tornado.alert?.properties?.event}
            </div>
            <div className="mt-0.5 truncate text-xs text-red-200/80">{tornado.alert?.properties?.areaDesc}</div>
          </div>
        </div>
      </div>
    );
  }
  if (tornado.inPostWindow) {
    const remainMs = tornado.postWindowMs - (Date.now() - tornado.lastEnd);
    const mins = Math.max(1, Math.round(remainMs / 60_000));
    const hrs = Math.floor(mins / 60);
    const remStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">All Clear Window</div>
            <div className="mt-0.5 text-sm font-semibold text-amber-100">
              Tornado warning has ended
            </div>
            <div className="mt-0.5 text-xs text-amber-200/80">
              SOS texts stay available for {remStr}.
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-3">
        <Check className="h-5 w-5 text-muted-foreground" />
        <div>
          <div className="text-sm font-semibold">No tornado warnings</div>
          <div className="text-xs text-muted-foreground">SOS texts unlock during tornado warnings.</div>
        </div>
      </div>
    </div>
  );
}

function MessageCard({ icon: Icon, accent, title, message, editing, draft, onStartEdit, onChangeDraft, onSave }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${accent}`} />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {!editing ? (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            style={{ minHeight: "auto" }}
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        ) : (
          <button
            onClick={onSave}
            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground"
            style={{ minHeight: "auto" }}
          >
            <Check className="h-3 w-3" /> Save
          </button>
        )}
      </div>

      {!editing ? (
        <p className="mt-3 whitespace-pre-line rounded-xl bg-secondary/40 p-3 text-sm text-foreground/90">
          {message}
        </p>
      ) : (
        <textarea
          value={draft}
          onChange={(e) => onChangeDraft(e.target.value)}
          rows={3}
          maxLength={300}
          className="mt-3 w-full resize-none rounded-xl border border-border/60 bg-secondary/40 p-3 text-sm outline-none focus:border-primary/60"
        />
      )}
    </div>
  );
}

function ConfirmSend({ mode, contacts, message, location, onConfirm, onCancel }) {
  const isHelp = mode === "help";
  const labelTone = isHelp ? "text-red-400" : "text-emerald-400";
  const btnClass = isHelp
    ? "bg-red-500 shadow-red-500/30"
    : "bg-emerald-500 shadow-emerald-500/30";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-t-3xl border-t border-border/60 bg-card p-5 sm:rounded-3xl sm:border shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${labelTone}`}>Ready to send</div>
        <h3 className="mt-1 text-lg font-bold">
          Send {isHelp ? '"Help Me"' : '"I\'m Safe"'}?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll fill in your message and live location for {contacts.length}{" "}
          {contacts.length === 1 ? "contact" : "contacts"}. You'll tap send.
        </p>

        <div className="mt-4 max-h-32 overflow-y-auto rounded-xl bg-secondary/40 p-3 text-xs space-y-1">
          {contacts.map((c) => (
            <div key={c.id} className="flex justify-between">
              <span>{c.name}</span>
              <span className="text-muted-foreground tabular-nums">{formatDisplay(c.phone)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-secondary/40 p-3 text-xs">
          <div className="text-muted-foreground">{message}</div>
          {location?.latitude && (
            <div className="mt-1 truncate font-mono text-primary">
              maps.google.com/?q={location.latitude.toFixed(4)},{location.longitude.toFixed(4)}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border/60 bg-secondary/40 py-3 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg ${btnClass}`}
          >
            <Send className="h-4 w-4" /> Open Messages
          </button>
        </div>
      </div>
    </div>
  );
}