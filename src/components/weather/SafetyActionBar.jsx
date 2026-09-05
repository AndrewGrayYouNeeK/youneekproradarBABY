import { LoaderCircle, Pause, Radio, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadShelterContacts, sendContactTexts } from "@/lib/safety/sms";
import { readCachedGps } from "@/lib/locationCache";
import { useRadio } from "@/lib/RadioContext";

function pulseHaptic(kind) {
  try {
    navigator.vibrate?.(kind === "emergency" ? [70, 40, 90] : [35]);
  } catch {
    /* ignore */
  }
}

export function SafetyActionBar({ compact = false }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = window.setTimeout(() => setFlash(null), 2200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const send = (kind) => {
    const contacts = loadShelterContacts();
    if (!contacts.length) {
      setStatus("Add a shelter contact, then one tap opens the text.");
      navigate("/Contacts");
      return;
    }

    pulseHaptic(kind);
    try {
      const result = sendContactTexts({
        kind,
        coords: readCachedGps(),
      });
      const nextStatus =
        kind === "emergency"
          ? `Help Me opened ${result.count} draft${result.count === 1 ? "" : "s"} — tap Send.`
          : `I'm Safe opened ${result.count} draft${result.count === 1 ? "" : "s"} — tap Send.`;
      setStatus(nextStatus);
      setFlash({
        kind,
        title: kind === "emergency" ? "Help Me" : "I'm Safe",
        body: nextStatus,
      });
    } catch (error) {
      if (error.code === "NO_CONTACTS") {
        navigate("/Contacts");
      }
      setStatus(error.message);
    }
  };

  const buttons = (
    <div className={`grid grid-cols-2 ${compact ? "gap-1.5" : "gap-2"}`}>
      <button
        type="button"
        onClick={() => send("emergency")}
        aria-label="Help Me text"
        className={`flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-red-900/30 ${
          compact
            ? "h-9 min-h-9 rounded-full bg-red-600 px-3 text-[12px]"
            : "min-h-12 rounded-2xl bg-red-600 px-3 text-sm"
        }`}
      >
        <ShieldAlert className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} aria-hidden="true" />
        Help Me
      </button>
      <button
        type="button"
        onClick={() => send("safe")}
        aria-label="I'm Safe text"
        className={`flex items-center justify-center gap-2 font-bold text-zinc-950 shadow-lg shadow-lime-900/20 ${
          compact
            ? "h-9 min-h-9 rounded-full bg-lime-400 px-3 text-[12px]"
            : "min-h-12 rounded-2xl bg-lime-400 px-3 text-sm"
        }`}
      >
        <ShieldCheck className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} aria-hidden="true" />
        I&apos;m Safe
      </button>
    </div>
  );

  return (
    <>
      {compact ? (
        buttons
      ) : (
        <div
          className="border-t border-white/10 bg-[#0c1016]/96 px-3 pt-2 backdrop-blur-xl"
          style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-lg">
            {buttons}
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              {status || "One tap opens Messages with your GPS. You still tap Send."}
            </p>
          </div>
        </div>
      )}
      {flash && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[2400] flex justify-center px-4">
          <div
            className={`max-w-sm rounded-2xl px-4 py-3 text-center shadow-2xl ${
              flash.kind === "emergency" ? "bg-red-600 text-white" : "bg-lime-400 text-zinc-950"
            }`}
          >
            <div className="text-sm font-bold">{flash.title}</div>
            <div className="mt-0.5 text-xs opacity-90">{flash.body}</div>
          </div>
        </div>
      )}
    </>
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
