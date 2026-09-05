import { Link } from "react-router-dom";
import WeatherShell from "@/components/weather/WeatherShell";

export default function Privacy() {
  return (
    <WeatherShell>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-md space-y-4 text-sm leading-relaxed text-slate-300">
          <p>
            YouNeeK Pro Radar is built to keep weather awareness on your device. Location is requested
            so the map, NOAA station, rain timing, and Apple WeatherKit forecast can center on you.
          </p>
          <p>
            Coordinates are sent to Apple WeatherKit (via our Cloudflare Worker), the National Weather
            Service, Iowa Mesonet, RainViewer, and Open-Meteo only to fetch weather for that point.
            We do not create accounts, we do not sell data, and we do not store your location on our servers.
          </p>
          <p>
            Help Me and I&apos;m Safe texts are drafts that open in your Messages app. Contacts live in
            this browser&apos;s local storage until you clear them.
          </p>
          <p>
            Apple Weather attribution: Weather data provided by Apple Weather. Learn more at{" "}
            <a className="text-lime-300 underline" href="https://developer.apple.com/weatherkit/get-started/" target="_blank" rel="noreferrer">
              WeatherKit
            </a>
            .
          </p>
          <Link to="/Settings" className="inline-block text-lime-300">
            Back to Settings
          </Link>
        </div>
      </div>
    </WeatherShell>
  );
}
