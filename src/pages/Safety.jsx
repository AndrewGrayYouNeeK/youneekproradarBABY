import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import useLocation from "@/hooks/useLocation";
import {
  loadContacts,
  loadMessage,
  saveMessage,
  buildSmsHref,
  formatDisplay,
  DEFAULT_MESSAGE,
} from "@/lib/safety/contactsStore";
import { fetchActiveAlerts, alertSeverity } from "@/lib/weather/api";
import { ShieldCheck, MessageSquare, Users, MapPin, Edit3, Check, AlertTriangle, Send } from "lucide-react";

export default function Safety() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [contacts, setContacts] = useState(loadContacts);
  const [message, setMessage] = useState(loadMessage);
  const [editingMsg, setEditingMsg] = useState(false);
  const [draftMsg, setDraftMsg] = useState(message);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sentAt, setSentAt] = useState(null);

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

  const activeAlerts = alertData?.features || [];
  const topAlert = [...activeAlerts].sort(
    (a, b) => alertSeverity(b.properties?.event).priority - alertSeverity(a.properties?.event).priority
  )[0];
  const severeActive = topAlert && alertSeverity(topAlert.properties?.event).priority >= 3;

  const handleSaveMessage = () => {
    const next = draftMsg.trim() || DEFAULT_MESSAGE;
    saveMessage(next);
    setMessage(next);
    setEditingMsg(false);
  };

  const handleSendSafe = () => {
    if (contacts.length === 0) {
      navigate("/Contacts");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    const numbers = contacts.map((c) => c.phone);
    const href = buildSmsHref(numbers, message, location);
    setSentAt(new Date());
    setConfirmOpen(false);
    // Open the SMS composer
    window.location.href = href;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Safety" location={location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`} />

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Status banner */}
        {severeActive ? (
          <div className="rounded-2xl border border-red-500/60 bg-red-950/40 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-300">Active Severe Weather</div>
                <div className="mt-0.5 truncate text-sm font-semibold text-red-100">
                  {topAlert.properties.event}
                </div>
                <div className="mt-0.5 truncate text-xs text-red-200/80">{topAlert.properties.areaDesc}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="text-sm font-semibold text-emerald-100">No active severe alerts</div>
                <div className="text-xs text-emerald-200/70">You're in the clear right now.</div>
              </div>
            </div>
          </div>
        )}

        {/* I'm Safe — primary action */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/15 via-card to-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <Send className="h-3.5 w-3.5" />
            I'm Safe Check-In
          </div>
          <p className="mt-2 text-sm text-foreground/80">
            Send your trusted contacts a text with your live GPS location. Opens your phone's
            messaging app — nothing is sent automatically.
          </p>

          <button
            onClick={handleSendSafe}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 text-base font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
          >
            <ShieldCheck className="h-5 w-5" />
            {contacts.length === 0 ? "Add Contacts to Get Started" : `Send "I'm Safe" to ${contacts.length}`}
          </button>

          {sentAt && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              Last opened at {sentAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
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
              {contacts.length === 0
                ? "No contacts added yet"
                : contacts.map((c) => c.name).join(", ")}
            </div>
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold tabular-nums">
            {contacts.length}
          </span>
        </button>

        {/* Message editor */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Your message</span>
            </div>
            {!editingMsg ? (
              <button
                onClick={() => { setDraftMsg(message); setEditingMsg(true); }}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                style={{ minHeight: "auto" }}
              >
                <Edit3 className="h-3 w-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveMessage}
                className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground"
                style={{ minHeight: "auto" }}
              >
                <Check className="h-3 w-3" /> Save
              </button>
            )}
          </div>

          {!editingMsg ? (
            <p className="mt-3 whitespace-pre-line rounded-xl bg-secondary/40 p-3 text-sm text-foreground/90">
              {message}
            </p>
          ) : (
            <textarea
              value={draftMsg}
              onChange={(e) => setDraftMsg(e.target.value)}
              rows={3}
              maxLength={300}
              className="mt-3 w-full resize-none rounded-xl border border-border/60 bg-secondary/40 p-3 text-sm outline-none focus:border-primary/60"
            />
          )}

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            A Google Maps link to your current location is automatically appended.
          </div>
        </div>

        <p className="px-2 pt-2 text-center text-[11px] text-muted-foreground">
          🔒 Contacts and location stay on this device. Nothing is shared until you tap send.
        </p>
      </div>

      {confirmOpen && (
        <ConfirmSend
          contacts={contacts}
          message={message}
          location={location}
          onConfirm={handleConfirmSend}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

function ConfirmSend({ contacts, message, location, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-t-3xl border-t border-border/60 bg-card p-5 sm:rounded-3xl sm:border shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Ready to send</div>
        <h3 className="mt-1 text-lg font-bold">Open your messaging app?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll fill in this message and your location for {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}. You'll tap send.
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/20"
          >
            <Send className="h-4 w-4" /> Open Messages
          </button>
        </div>
      </div>
    </div>
  );
}