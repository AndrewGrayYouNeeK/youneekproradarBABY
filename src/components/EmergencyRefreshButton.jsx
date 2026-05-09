import { useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Tiny always-on-top refresh button. If the UI ever gets stuck (overlays,
 * hidden controls, frozen state), tap this to do a hard reload of the page.
 */
export default function EmergencyRefreshButton() {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    // Small delay so the spin animation is visible before reload
    setTimeout(() => window.location.reload(), 150);
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      aria-label="Refresh app"
      title="Refresh app"
      className="fixed bottom-20 right-2 z-[9999] flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground/80 shadow-lg backdrop-blur-md hover:bg-background hover:text-foreground active:scale-95"
      style={{ minHeight: "auto" }}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
    </button>
  );
}