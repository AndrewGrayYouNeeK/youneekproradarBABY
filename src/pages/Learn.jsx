import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";

export default function Learn() {
  return (
    <div className="h-full overflow-y-auto bg-background pb-24 text-foreground">
      <AppHeader title="Learn" showBack />

      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-4 pb-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            How to Read NEXRAD Weather Radar: A Plain-English Guide
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to interpret the colors, layers, and warnings inside YouNeeK Pro Radar.
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-foreground/90">
          <h2 className="text-lg font-semibold text-foreground">What NEXRAD actually shows</h2>
          <p>
            NEXRAD — the U.S. Next-Generation Radar network — is a constellation of 159 high-resolution Doppler
            radar sites operated by the National Weather Service. Each site sweeps the sky every 4–6 minutes
            and measures how much energy bounces back from precipitation in the air. The brighter the return,
            the more (or larger) the droplets, hail, or snow particles in that volume of atmosphere.
          </p>
          <p>
            On the radar map, those returns are translated into a color scale measured in <strong>dBZ</strong>
            (decibels relative to Z). Light blue around 5–15 dBZ means drizzle or virga. Greens (25–35 dBZ) are
            light to moderate rain. Yellows and oranges (40–50 dBZ) mean heavy rain. Red, magenta, and white
            (55+ dBZ) frequently indicate hail or extremely intense thunderstorm cores. The legend on every
            screen of YouNeeK Pro Radar maps these values back to colors so you never have to guess.
          </p>

          <h2 className="text-lg font-semibold text-foreground">Reflectivity vs. echo tops vs. precipitation</h2>
          <p>
            <strong>Base reflectivity</strong> is the standard view — a snapshot of precipitation intensity at
            the lowest scan angle. <strong>Echo tops</strong> measures how high a storm reaches; tops above
            50,000 feet often mean strong updrafts and severe weather potential. <strong>1-hour, 24-hour, and
            72-hour precipitation</strong> products accumulate rainfall over time, which is the right tool for
            spotting flash-flood threats and watershed-scale rain events.
          </p>

          <h2 className="text-lg font-semibold text-foreground">Watches, warnings, and advisories</h2>
          <p>
            A <strong>watch</strong> means conditions are favorable — stay alert. A <strong>warning</strong>
            means severe weather is happening or imminent — take protective action now. An{" "}
            <strong>advisory</strong> is a step below a warning: dangerous but not life-threatening for most
            people. Tornado, flash-flood, and hurricane warnings are the highest priority and will trigger a
            full-screen alert in this app with safety instructions.
          </p>

          <h2 className="text-lg font-semibold text-foreground">Time-lapse: spotting motion and rotation</h2>
          <p>
            A still radar image tells you what is happening. A loop tells you what is <em>about to</em>. The
            time-lapse feature in YouNeeK Pro Radar plays the last hour of frames at adjustable speeds so you
            can see whether a storm is growing, weakening, or rotating — the textbook hook-echo signature of
            a possible tornado is far easier to spot in motion than in a single frame.
          </p>

          <h2 className="text-lg font-semibold text-foreground">When to trust the app — and when to call 911</h2>
          <p>
            Radar is a planning tool, not a substitute for emergency services. If you are in immediate danger
            from a tornado, flood, or wildfire, call 911 and follow your local NWS office. YouNeeK Pro Radar
            is designed to give you the earliest possible heads-up so you can shelter, communicate with loved
            ones via the "I'm Safe" feature, and make better decisions before the situation becomes urgent.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}