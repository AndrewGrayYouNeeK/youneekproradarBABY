const SIGNS = [
  { src: "/neon/logo-1.webp", alt: "Green and magenta neon sign reading YouNeeK Pro Radar" },
  { src: "/neon/logo-2.webp", alt: "Neon YouNeeK Pro Radar sign with a lightning bolt" },
];

/** Original neon sign photos from the YNK222 landing, plus the tube-light wordmark. */
export default function NeonSigns() {
  return (
    <section id="neon" className="relative overflow-hidden border-y border-[#00ff9c]/20 bg-black px-4 py-16 md:px-8 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,212,0.14),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-[#ff00d4]">// NEON_SIGNAL</div>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Lit up like a <span className="ynk-neon">storm cell</span>.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {SIGNS.map((sign, index) => (
            <figure key={sign.src} className="relative border border-[#00ff9c]/30 bg-black">
              <span className="absolute left-2 top-2 z-10 h-3 w-3 border-l border-t border-[#00ff9c]" />
              <span className="absolute right-2 top-2 z-10 h-3 w-3 border-r border-t border-[#ff00d4]" />
              <span className="absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-[#ff00d4]" />
              <span className="absolute bottom-2 right-2 z-10 h-3 w-3 border-b border-r border-[#00ff9c]" />
              <figcaption className="absolute left-1/2 top-3 z-10 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#00ff9c]/70">
                LOGO_0{index + 1}
              </figcaption>
              <img
                src={sign.src}
                alt={sign.alt}
                width={1024}
                height={559}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
