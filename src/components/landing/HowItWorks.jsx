import RadarSweep from "@/components/landing/RadarSweep";
import PhoneFrame from "@/components/landing/PhoneFrame";
import { HOW_HEADING, HOW_POINTS, SCREEN_PLACEHOLDERS } from "@/lib/landing/launch";

function AlertsMock() {
  const rows = [
    ["Tornado", "Polygon outline"],
    ["Severe thunderstorm", "Polygon outline"],
    ["Flood", "Polygon outline"],
    ["Winter", "Polygon outline"],
  ];
  return (
    <ul className="space-y-2">
      {rows.map(([name, kind]) => (
        <li key={name} className="border border-[#ff4d6a]/50 bg-[#2a0a12] px-3 py-2">
          <div className="text-sm font-bold text-white">{name}</div>
          <div className="text-[11px] text-white/70">{kind}</div>
        </li>
      ))}
    </ul>
  );
}

function ShelterMock() {
  const steps = ["A warning covers your location", "You review the text", "You tap Send"];
  return (
    <ol className="space-y-2">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-2 text-sm text-white">
          <span className="font-mono text-[#00ff9c]">{index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function ScreenBody({ id }) {
  switch (id) {
    case "radar":
      return <RadarSweep />;
    case "alerts":
      return <AlertsMock />;
    case "shelter":
      return <ShelterMock />;
    default: {
      const unexpected = id;
      return <p className="text-sm text-white">Missing placeholder: {unexpected}</p>;
    }
  }
}

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 px-4 py-12 md:px-8" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="how-heading" className="text-3xl font-black leading-tight text-white md:text-4xl">
          {HOW_HEADING}
        </h2>
        <ul className="mt-5 max-w-2xl space-y-2 text-sm leading-relaxed text-white/85 md:text-base">
          {HOW_POINTS.map((point) => (
            <li key={point} className="border-l-2 border-[#00ff9c] pl-3">
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {SCREEN_PLACEHOLDERS.map((screen) => (
            <PhoneFrame key={screen.id} title={screen.title} caption={screen.caption}>
              <ScreenBody id={screen.id} />
            </PhoneFrame>
          ))}
        </div>
      </div>
    </section>
  );
}
