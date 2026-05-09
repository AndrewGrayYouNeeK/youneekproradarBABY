import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import { Shield, MapPin, Users, Database, Lock, AlertTriangle } from "lucide-react";

export default function Privacy() {
  return (
    <div className="h-full overflow-y-auto bg-background pb-24 text-foreground">
      <AppHeader title="Privacy" showBack />

      <main className="mx-auto max-w-2xl space-y-5 px-4 pt-4 pb-8">
        <header>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Shield className="h-3.5 w-3.5" />
            Privacy Policy
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Your data stays yours</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            YouNeeK Pro Radar is built privacy-first. We collect only what's needed to show you accurate
            local weather — and most of it never leaves your device.
          </p>
        </header>

        <Section icon={MapPin} title="Location">
          Your GPS coordinates are used to fetch weather, radar, and alerts for your area. They're sent
          directly to public weather services (NWS, NOAA, Open-Meteo) and are not stored on our servers.
        </Section>

        <Section icon={Users} title="Emergency Contacts">
          The contacts you add for "Help Me" SMS are stored locally on your device only. We never see,
          sync, or share them. SMS messages are sent through your phone's native messaging app — we have
          no involvement in delivery.
        </Section>

        <Section icon={Database} title="Saved Locations & Settings">
          Bookmarks, units, and preferences live in your device's local storage. Clearing your browser data
          or uninstalling the app removes everything.
        </Section>

        <Section icon={Lock} title="Account Data">
          If you sign in, we store your email and profile info to authenticate you. We do not sell, share,
          or use your data for advertising.
        </Section>

        <Section icon={AlertTriangle} title="Third-Party Data Sources">
          Weather data is provided by the National Weather Service, NOAA, Iowa Environmental Mesonet,
          Open-Meteo, and RainViewer. Their public APIs receive your approximate coordinates to return
          forecasts.
        </Section>

        <p className="px-1 pt-2 text-center text-[11px] text-muted-foreground">
          Questions? Email{" "}
          <a className="text-primary hover:underline" href="mailto:andrewgray@youneek.xyz">
            andrewgray@youneek.xyz
          </a>
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}