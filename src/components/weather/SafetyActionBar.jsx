import { LoaderCircle, Pause, Radio } from "lucide-react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadShelterContacts, sendContactTexts } from "@/lib/safety/sms";
import { readCachedGps } from "@/lib/locationCache";
import { useRadio } from "@/lib/RadioContext";

export function SafetyActionBar({ compact = false }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (kind) => {
    if (busy) return;
    const contacts = loadShelterContacts();
    if (!contacts.length) {
      navigate("/Contacts");
      setStatus("Add a contact, then one tap sends the text.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const result = await sendContactTexts({
        kind,
        coords: readCachedGps(),
      });
      setStatus(
        kind === "emergency"
          ? `Help Me opened ${result.count} draft${result.count === 1 ? "" : "s"} — tap Send.`
          : `I'm Safe opened ${result.count} draft${result.count === 1 ? "" : "s"} — tap Send.`
      );
    } catch (error) {
      if (error.code === "NO_CONTACTS") {
        navigate("/Contacts");
      }
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => send("emergency")}
          disabled={busy}
          aria-label="Help Me text"
          className="flex h-9 min-h-9 items-center gap-1 rounded-full bg-red-600 px-2.5 text-[11px] font-bold text-white disabled:opacity-50"
        >
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          Help
        </button>
        <button
          type="button"
          onClick={() => send("safe")}
          disabled={busy}
          aria-label="I'm Safe text"
          className="flex h-9 min-h-9 items-center gap-1 rounded-full bg-lime-400 px-2.5 text-[11px] font-bold text-zinc-950 disabled:opacity-50"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Safe
        </button>
      </div>
    );
  }

  return (
    <div
      className="border-t border-white/10 bg-[#0c1016]/96 px-3 pt-2 backdrop-blur-xl"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => send("emergency")}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 disabled:opacity-50"
        >
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          {busy ? "Opening…" : "Help Me"}
        </button>
        <button
          type="button"
          onClick={() => send("safe")}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-3 text-sm font-bold text-zinc-950 shadow-lg shadow-lime-900/20 disabled:opacity-50"
        >
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          {busy ? "Opening…" : "I'm Safe"}
        </button>
      </div>
      {status && <p className="mx-auto mt-1.5 max-w-lg text-center text-[11px] text-slate-400">{status}</p>}
    </div>
  );
}

export function RadioMiniButton() {
  const { isPlaying, isBuffering, togglePlayback } = useRadio();
  return (
    <button
      type="button"
      onClick={togglePlayback}
      aria-label={isPlaying ? "Pause weather radio" : "Play weather radio"}
      className="flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
    >
      {isBuffering ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Radio className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
