import { Radio, ShieldAlert, Smartphone, TriangleAlert } from "lucide-react";
import { FEATURES } from "@/lib/landing/launch";

const ICONS = {
  nexrad: Radio,
  alerts: TriangleAlert,
  shelter: Smartphone,
  purchase: ShieldAlert,
};

export default function FeatureCards() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-12 md:px-8" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="features-heading" className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00ff9c]">
          In the app
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.id] || Radio;
            return (
              <article key={feature.id} className="border border-[#00ff9c]/30 bg-black/75 p-4 backdrop-blur-md">
                <Icon className="h-5 w-5 text-[#00ff9c]" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{feature.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
