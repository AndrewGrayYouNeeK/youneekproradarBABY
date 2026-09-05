import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { sendContactTexts } from "@/lib/safety/sms";
import { readCachedGps } from "@/lib/locationCache";

export default function SafetyTextActions({ compact = false }) {
  const [status, setStatus] = useState("");

  const send = (kind) => {
    try {
      const result = sendContactTexts({
        kind,
        coords: readCachedGps(),
      });
      setStatus(`Opened Messages for ${result.count} contact${result.count === 1 ? "" : "s"} — tap Send.`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        <button
          type="button"
          onClick={() => send("emergency")}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-500"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Help Me
        </button>
        <button
          type="button"
          onClick={() => send("safe")}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lime-400 px-3 py-3 text-sm font-bold text-zinc-950 hover:bg-lime-300"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          I&apos;m Safe
        </button>
      </div>
      <p className="text-xs text-slate-400">
        {status || "One tap opens a text with your location. You still tap Send."}
      </p>
    </div>
  );
}
