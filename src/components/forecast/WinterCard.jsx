export default function WinterCard({ days = [] }) {
  const snowDays = days.filter((day) => Number(day.snow) > 0);
  if (!snowDays.length) return null;
  const total = snowDays.reduce((sum, day) => sum + Number(day.snow || 0), 0);

  return (
    <section className="rounded-2xl border border-sky-400/20 bg-sky-950/30 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">Winter & snow</h2>
      <p className="mt-2 text-sm text-white">{total.toFixed(1)}" possible over the next 10 days</p>
      <div className="mt-3 space-y-1.5">
        {snowDays.slice(0, 5).map((day) => (
          <div key={day.date} className="flex items-center justify-between text-xs text-sky-100/80">
            <span>{new Date(day.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
            <span>{Number(day.snow).toFixed(1)}"</span>
          </div>
        ))}
      </div>
    </section>
  );
}
