import { useState } from "react";
import useAppNav from "@/hooks/useAppNav";
import { Menu, MapPin, X, Settings as SettingsIcon, Users, Info, Shield, ArrowLeft, Radar as RadarIcon, BookOpen, Mail, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppHeader({ title, location, right = null, transparent = false, showBack = false }) {
  const { goBack, go } = useAppNav();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className={`safe-top sticky top-0 z-30 ${
          transparent ? "bg-gradient-to-b from-background/95 to-transparent" : "glass-strong border-b border-border/60"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-3">
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="flex h-10 items-center gap-1 rounded-xl px-2 text-foreground/90 hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-xs font-semibold">Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground/90 hover:bg-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-1 flex-col items-center justify-center px-2 leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {title}
            </div>
            {location && (
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="max-w-[180px] truncate">{location}</span>
              </div>
            )}
          </div>

          <div className="flex h-10 min-w-10 items-center justify-end">
            {right}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <SideMenu onClose={() => setOpen(false)} onNavigate={(p) => { setOpen(false); go(p); }} />
        )}
      </AnimatePresence>
    </>
  );
}

function SideMenu({ onClose, onNavigate }) {
  const items = [
    { label: "Radar", icon: RadarIcon, path: "/Radar" },
    { label: "Locations", icon: MapPin, path: "/Locations" },
    { label: "Contacts", icon: Users, path: "/Contacts" },
    { label: "Settings", icon: SettingsIcon, path: "/Settings" },
    { label: "Learn", icon: BookOpen, path: "/Learn" },
    { label: "FAQ", icon: HelpCircle, path: "/FAQ" },
    { label: "About", icon: Info, path: "/About" },
    { label: "Contact", icon: Mail, path: "/Contact" },
    { label: "Privacy", icon: Shield, path: "/Privacy" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="absolute left-0 top-0 h-full w-72 glass-strong border-r border-border/60 safe-top"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YouNeeK</div>
            <div className="text-base font-bold">Pro Radar</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-2">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => onNavigate(it.path)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-secondary"
            >
              <it.icon className="h-4 w-4 text-primary" />
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-border/60 px-4 py-4 text-[11px] text-muted-foreground safe-bottom">
          Data: NWS · NOAA · Open-Meteo
        </div>
      </motion.aside>
    </motion.div>
  );
}