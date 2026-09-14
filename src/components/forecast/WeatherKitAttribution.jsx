export default function WeatherKitAttribution({ metadata }) {
  if (!metadata?.attributionURL && !metadata?.attribution) return null;

  const brand = metadata.attribution || {};
  const logo = brand["logoDark@2x"] || brand["logoDark@1x"] || brand["logoSquare@2x"];
  const name = brand.serviceName || "Apple Weather";
  const sourcesUrl = metadata.attributionURL;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {logo ? (
          <img src={logo} alt={name} className="h-5 w-auto max-w-[160px] object-contain object-left" />
        ) : (
          <p className="text-xs text-slate-400">{name}</p>
        )}
        <div className="flex flex-col items-end gap-1 text-[11px]">
          {sourcesUrl && (
            <a
              href={sourcesUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 hover:text-sky-200"
            >
              Data sources
            </a>
          )}
          {metadata.alertDetailsUrl && (
            <a
              href={metadata.alertDetailsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200"
            >
              Alert details
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
