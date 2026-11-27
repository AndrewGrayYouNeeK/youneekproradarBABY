import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import { NavigationStackProvider } from "@/lib/NavigationStack";
import { RadioProvider } from "@/lib/RadioContext";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

const Landing = lazy(() => import("./pages/Landing"));
const LandingPrivacy = lazy(() => import("./pages/LandingPrivacy"));
const LandingSupport = lazy(() => import("./pages/LandingSupport"));
const LandingLocked = lazy(() => import("./pages/LandingLocked"));

/** The web radar preview lives on the radar Worker. Old /Radar links go there. */
function RadarPreviewRedirect() {
  if (typeof window !== "undefined") window.location.replace(RADAR_APP_URL);
  return null;
}

/** Former web-app pages. Their features are app-only now. */
const LOCKED_PATHS = ["/Forecast", "/Hourly", "/Daily", "/Radio", "/Globe", "/Contacts", "/Settings"];

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#4DA6EA]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
  </div>
);

function isLandingPath() {
  // Every page on this site is a dark landing-style page now.
  return true;
}

const AppRoutes = () => {
  const location = useLocation();
  const landing = isLandingPath(location.pathname);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={landing ? "min-h-[100dvh]" : "h-full"}
        >
          <Suspense fallback={<Spinner />}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/privacy" element={<LandingPrivacy />} />
              <Route path="/support" element={<LandingSupport />} />
              <Route path="/Radar" element={<RadarPreviewRedirect />} />
              {LOCKED_PATHS.map((path) => (
                <Route key={path} path={path} element={<LandingLocked />} />
              ))}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

function AppFrame() {
  const location = useLocation();
  const landing = isLandingPath(location.pathname);
  return (
    <div
      className={
        landing
          ? "min-h-[100dvh] w-full bg-black text-white"
          : "mx-auto h-[100dvh] w-full max-w-4xl overflow-hidden bg-[#4DA6EA] text-white"
      }
    >
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationStackProvider>
            <RadioProvider>
            <AppFrame />
            <Toaster />
            </RadioProvider>
          </NavigationStackProvider>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
