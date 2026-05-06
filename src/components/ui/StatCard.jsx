export default function StatCard({ icon: Icon, label, value, sub, accent = "text-primary" }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-3.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {Icon && <Icon className={`h-3.5 w-3.5 ${accent}`} />}
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold leading-none">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}