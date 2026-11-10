import { APP_DOWNLOAD_LABEL, appDownloadHref, appDownloadIsLive } from "@/lib/landing/launch";

export default function AppDownloadLink({ className, children }) {
  const live = appDownloadIsLive();
  const content = (
    <>
      {APP_DOWNLOAD_LABEL}
      {children}
    </>
  );
  if (!live) {
    return (
      <a href="#waitlist" className={className}>
        {content}
      </a>
    );
  }
  return (
    <a href={appDownloadHref()} className={className} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}
