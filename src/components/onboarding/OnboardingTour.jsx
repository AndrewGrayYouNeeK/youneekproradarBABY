import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, AlertTriangle, Radio, CloudSun, ShieldCheck, ChevronRight, X } from "lucide-react";

const SLIDES = [
  {
    icon: Radar,
    accent: "text-cyan-400",
    bg: "from-cyan-500/20 to-transparent",
    title: "Live NEXRAD Radar",
    desc: "Real-time storm tracking with time-lapse loops, multiple radar layers, and hurricane overlays.",
  },
  {
    icon: AlertTriangle,
    accent: "text-red-400",
    bg: "from-red-500/20 to-transparent",
    title: "Severe Weather Alerts",
    desc: "Tornado, hurricane, and flash-flood warnings the moment NWS issues them — with shelter guidance.",
  },
  {
    icon: Radio,
    accent: "text-emerald-400",
    bg: "from-emerald-500/20 to-transparent",
    title: "NOAA Weather Radio",
    desc: "Auto-tunes to your nearest station so you never miss a broadcast — even when cell service drops.",
  },
  {
    icon: CloudSun,
    accent: "text-yellow-400",
    bg: "from-yellow-500/20 to-transparent",
    title: "Hyper-Local Forecast",
    desc: "Hourly + 7-day forecasts, SPC outlooks, heat risk, and air quality — all in one tap.",
  },
  {
    icon: ShieldCheck,
    accent: "text-green-400",
    bg: "from-green-500/20 to-transparent",
    title: "I'm Safe Check-Ins",
    desc: "Reassure loved ones with a single tap during emergencies. Your trusted contacts get an instant SMS.",
  },
];

export default function OnboardingTour({ onClose }) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const Icon = slide.icon;
  const isLast = i === SLIDES.length - 1;

  const next = () => (isLast ? onClose() : setI(i + 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background safe-screen"
    >
      <button
        onClick={onClose}
        aria-label="Skip tour"
        className="absolute right-4 top-4 z-10 flex h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:bg-secondary safe-top"
      >
        Skip
        <X className="h-4 w-4" />
      </button>

      <div className="flex h-full flex-col">
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${slide.bg}`} />
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col items-center px-8 text-center"
            >
              <div className={`mb-8 flex h-28 w-28 items-center justify-center rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl ${slide.accent}`}>
                <Icon className="h-14 w-14" strokeWidth={1.6} />
              </div>
              <h1 className="mb-3 text-3xl font-black leading-tight">{slide.title}</h1>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{slide.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-8 safe-bottom">
          <div className="mb-6 flex justify-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-8 bg-primary" : "w-1.5 bg-border"
                }`}
                style={{ minHeight: "auto" }}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            {isLast ? "Get Started" : "Next"}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}