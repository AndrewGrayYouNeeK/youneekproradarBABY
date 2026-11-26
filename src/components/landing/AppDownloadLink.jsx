import { APP_COMING_SOON, appDownloadHref, appDownloadIsLive } from "@/lib/landing/launch";

/** Get the App. Until APP_DOWNLOAD_URL is set it is a non-link "coming soon" button. */
export default function AppDownloadLink({ className, children }) {
  if (!appDownloadIsLive()) {
    return (
      <span className={`${className} cursor-default opacity-80`} aria-disabled="true" title={APP_COMING_SOON}>
        Get the App · Coming soon
        {children}
      </span>
    );
  }
  return (
    <a href={appDownloadHref()} className={className} target="_blank" rel="noreferrer">
      Get the App
      {children}
    </a>
  );
}
