export default function PhoneFrame({ title, caption, children }) {
  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border border-white/15 bg-zinc-950 p-2.5 shadow-[0_0_36px_rgba(0,255,156,0.12)]">
        <div className="mb-2 flex justify-center" aria-hidden="true">
          <div className="h-1.5 w-16 rounded-full bg-white/25" />
        </div>
        <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black">
          <div className="border-b border-[#ffb4c0]/30 bg-[#5c1020] px-3 py-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd0d8]">
            Placeholder · {title}
          </div>
          <div className="px-3 py-4">{children}</div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs leading-relaxed text-white/75">{caption}</figcaption>
    </figure>
  );
}
