import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";

const FAQS = [
  {
    q: "Is YouNeeK Pro Radar free to use?",
    a: "Yes. The app is free for personal use and pulls all of its data from public, government-funded sources including the U.S. National Weather Service, NOAA, the National Hurricane Center, the Iowa Environmental Mesonet, and Open-Meteo. There are no subscriptions, no paywalls, and no advertising trackers.",
  },
  {
    q: "How fresh is the radar imagery?",
    a: "NEXRAD radar tiles update every 4–6 minutes — the same cadence the National Weather Service publishes them. The app auto-refreshes the live view every 60 seconds. The time-lapse loop covers the most recent hour in 5-minute frames, so you can see exactly how a storm is moving and whether it is intensifying.",
  },
  {
    q: "Does the app work offline?",
    a: "Most features require an active internet connection because radar tiles, alerts, and forecasts are streamed in real time. However, your saved locations, safety contacts, and personalized 'I'm Safe' message are stored entirely on your device and remain available offline so you can still send a check-in text the moment you regain signal.",
  },
  {
    q: "Will the app send me push notifications for tornado warnings?",
    a: "When you have the app open in your browser or installed as a PWA, an active tornado, hurricane, or flash-flood warning for your current location will trigger a full-screen popup with safety instructions and a one-tap 'I'm Safe' shortcut. We always recommend pairing this with NOAA Weather Radio and your phone's built-in Wireless Emergency Alerts (WEA) for redundancy.",
  },
  {
    q: "How accurate are the forecasts?",
    a: "Hourly and 7-day forecasts come from Open-Meteo's blended numerical weather prediction models. They are typically accurate to within a few degrees and a few percentage points of precipitation probability for the next 48 hours, with skill decreasing further out. For high-stakes decisions, always cross-check with your local NWS forecast office.",
  },
  {
    q: "Is my location data shared with anyone?",
    a: "No. Your GPS coordinates are used only to load nearby radar, alerts, and forecasts. Saved locations, safety contacts, and your custom 'I'm Safe' message live exclusively in your browser's local storage. Coordinates are shared via SMS only when you explicitly tap the 'I'm Safe' button — never automatically.",
  },
  {
    q: "What is NOAA Weather Radio and how does the app pick a station?",
    a: "NOAA Weather Radio (NWR) is a network of more than 1,000 government VHF radio transmitters that broadcast continuous weather information and emergency alerts. The app uses your device's location to identify and stream the nearest available NWR feed automatically; you can also pick any station manually from the Radio screen.",
  },
  {
    q: "Who builds and maintains YouNeeK Pro Radar?",
    a: "The app is built by an independent team of weather enthusiasts and software engineers under the YouNeeK brand. We are not affiliated with NOAA, the NWS, or any government agency — we simply visualize their excellent public data. See the Contact page to reach the team with questions, bug reports, or feature ideas.",
  },
];

export default function FAQ() {
  return (
    <div className="h-full overflow-y-auto bg-background pb-24 text-foreground">
      <AppHeader title="FAQ" showBack />

      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-4 pb-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            Frequently Asked Questions about YouNeeK Pro Radar
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick answers about coverage, data sources, accuracy, privacy, and how the app keeps you safe in
            severe weather.
          </p>
        </header>

        <section className="space-y-3">
          {FAQS.map((item, i) => (
            <article
              key={i}
              className="rounded-2xl border border-border/60 bg-card/60 p-4"
            >
              <h2 className="text-sm font-semibold text-foreground">{item.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{item.a}</p>
            </article>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}