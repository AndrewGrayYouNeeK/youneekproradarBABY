export default function LifestyleCard({ items = [] }) {
  if (!items.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Lifestyle forecast
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className={`text-sm font-semibold ${item.score >= 80 ? "text-emerald-300" : item.score >= 55 ? "text-yellow-300" : "text-orange-300"}`}>
                {item.score}
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full ${item.score >= 80 ? "bg-emerald-400" : item.score >= 55 ? "bg-yellow-400" : "bg-orange-400"}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-slate-400">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
