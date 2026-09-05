import { Trash2 } from "lucide-react";

const TYPE_SYMBOLS = {
  surface: "□",
  air: "△",
  subsurface: "▽",
  unknown: "◇",
};

export default function TargetList({ targets, onTargetClick, onDeleteTarget }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Plotted contacts ({targets.length})
      </div>
      {targets.length === 0 && (
        <div className="px-3 pb-3 text-center text-xs text-slate-500">
          Tap the map to add a contact
        </div>
      )}
      <ul>
        {targets.map((target) => (
          <li
            key={target.id}
            className="flex cursor-pointer items-center justify-between border-t border-white/5 px-3 py-2 hover:bg-white/5"
            onClick={() => onTargetClick(target)}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-lime-400">
                {TYPE_SYMBOLS[target.type] || "◇"}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-white">
                  {target.callsign}
                </div>
                <div className="text-[11px] text-slate-500">
                  {target.bearing.toString().padStart(3, "0")}° / {target.range}nm
                </div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteTarget(target.id); }}
              className="ml-2 text-slate-500 hover:text-red-400"
              aria-label={`Delete ${target.callsign}`}
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
