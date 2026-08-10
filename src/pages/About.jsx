import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";

export default function About() {
  return (
    <div className="h-full overflow-y-auto bg-background pb-24 text-foreground">
      <AppHeader title="About" showBack />

      <main className="mx-auto max-w-2xl space-y-5 px-4 pt-4 pb-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">About YouNeeK Pro Radar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time NEXRAD radar, NOAA alerts, and weather radio — built for storm-aware people.
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>
            <strong>YouNeeK Pro Radar</strong> is a fast, mobile-first severe-weather companion. It pulls live
            NEXRAD reflectivity tiles from the Iowa Environmental Mesonet, active warnings and watches from the
            U.S. National Weather Service (api.weather.gov), and current conditions, hourly forecasts, and
            7-day outlooks from Open-Meteo. Together these public data sources give you the same situational
            awareness used by emergency managers, storm chasers, and meteorology students — packaged into a meteorology students — packaged into a
            single screen that works on any phone, tablet, or desktop browser.
          </p>
          <p>
            The app is built for <strong>everyday people who live in severe-weather country</strong>: families
            who want a tornado siren on their nightstand, parents tracking school-bus routes through a
            thunderstorm, hikers checking lightning before a trailhead, drivers planning around flash floods,
            and anyone who has ever wished a weather app would just <em>show them the storm</em>. It is also a
            useful tool for amateur radio operators, SKYWARN spotters, and outdoor-event organizers who need
            a quick second opinion on what the atmosphere is doing right now.
          </p>
          <p>
            Core features include an animated time-lapse radar loop, hurricane and tropical storm tracking,
            SPC convective outlooks, heat-risk forecasts, NOAA Weather Radio audio with auto-tuning to your
            nearest broadcast, an "I'm Safe" check-in that texts trusted contacts your GPS coordinates, and
            tornado-warning popups that interrupt the app with safety instructions. A native iOS app with
            Apple WeatherKit forecasts is available in the <code>ios/</code> folder for App Store release later.
            Everything is designed to stay readable in a dark room, accessible with one thumb, and respectful
            of your data — saved locations and safety contacts live only on your device.
          </p>
          <p>
            <strong>Who builds it:</strong> YouNeeK Pro Radar is developed by the YouNeeK team, an
            independent group of weather enthusiasts and software engineers. We are not affiliated with NOAA,
            the National Weather Service, or any government agency. We rely on their excellent public data
            and credit them on every screen where their information appears. Questions, bug reports, and
            feature ideas are always welcome — see the Contact page for ways to reach us.
          </p>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">
          <div className="font-semibold uppercase tracking-[0.18em] text-foreground/80">Data Sources</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>NEXRAD radar tiles — Iowa Environmental Mesonet</li>
            <li>Active alerts — api.weather.gov (NWS)</li>
            <li>Forecasts &amp; air quality — open-meteo.com</li>
            <li>Tropical cyclones — National Hurricane Center</li>
          </ul>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}