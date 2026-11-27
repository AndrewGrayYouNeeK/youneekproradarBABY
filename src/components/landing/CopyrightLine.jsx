import { COPYRIGHT_LINE } from "@/lib/landing/launch";

/** Small muted trademark + copyright line for every youneekproradar.com page footer. */
export default function CopyrightLine({ className = "" }) {
  return <p className={`font-mono text-[11px] tracking-[0.08em] text-[#00ff9c]/45 ${className}`}>{COPYRIGHT_LINE}</p>;
}
