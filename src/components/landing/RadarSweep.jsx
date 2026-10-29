/** CSS radar scope restored from the original landing hero. */
export default function RadarSweep() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px] md:max-w-[420px]" aria-hidden="true">
      <div className="absolute inset-0 animate-pulse rounded-full bg-[#00ff9c]/10 blur-3xl" />
      <div className="absolute inset-0 rounded-full border border-[#00ff9c]/40" />
      <div className="absolute inset-[8%] rounded-full border border-[#00ff9c]/30" />
      <div className="absolute inset-[20%] rounded-full border border-dashed border-[#00ff9c]/25" />
      <div className="absolute inset-[34%] rounded-full border border-[#ff00d4]/30" />
      <div className="absolute inset-[48%] rounded-full border border-[#00ff9c]/25" />
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[#00ff9c]/20" />
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#00ff9c]/20" />
      <div
        className="ynk-radar-sweep absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0,255,156,0) 270deg, rgba(0,255,156,0.5) 350deg, rgba(0,255,156,0.95) 360deg)",
          maskImage: "radial-gradient(circle, black 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 100%)",
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff9c] shadow-[0_0_12px_#00ff9c]" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.28em] text-[#00ff9c]">
        SCAN
      </div>
    </div>
  );
}
