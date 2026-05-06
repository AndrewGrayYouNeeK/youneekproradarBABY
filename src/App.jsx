import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import TornadoAlertPopup from "@/components/safety/TornadoAlertPopup";
import OnboardingGate from "@/components/onboarding/OnboardingGate";

const Radar = lazy(() => import("./pages/Radar"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Radio = lazy(() => import("./pages/Radio"));
const Safety = lazy(() => import("./pages/Safety"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const Locations = lazy(() => import("./pages/Locations"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Learn = lazy(() => import("./pages/Learn"));
const FAQ = lazy(() => import("./pages/FAQ"));

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
  </div>
);

// Tabs that should retain their state (scroll position, mounted instance)
// when the user switches away and comes back.
const TABS = [
  { path: "/Radar", Component: Radar },
  { path: "/Forecast", Component: Forecast },
  { path: "/Alerts", Component: Alerts },
  { path: "/Radio", Component: Radio },
  { path: "/Safety", Component: Safety },
];

const TAB_PATHS = TABS.map((t) => t.path);

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) return <Spinner />;

  if (authError) {
    if (authError.type === "user_not_registered") return <UserNotRegisteredError />;
    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  const isTab = TAB_PATHS.includes(location.pathname);

  return (
    <>
      {/* Persistent tab layer — all main tabs stay mounted so scroll position
          and component state are preserved when switching between them. */}
      <Suspense fallback={<Spinner />}>
        {TABS.map(({ path, Component }) => {
          const active = location.pathname === path;
          return (
            <div
              key={path}
              aria-hidden={!active}
              style={{
                display: active ? "block" : "none",
                height: "100%",
              }}
            >
              <Component />
            </div>
          );
        })}
      </Suspense>

      {/* Non-tab routes get an iOS-style slide-and-fade transition */}
      {!isTab && (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 32, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="h-full will-change-transform"
          >
            <Suspense fallback={<Spinner />}>
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/Radar" replace />} />
                <Route path="/Contacts" element={<Contacts />} />
                <Route path="/Locations" element={<Locations />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/About" element={<About />} />
                <Route path="/Contact" element={<Contact />} />
                <Route path="/Learn" element={<Learn />} />
                <Route path="/FAQ" element={<FAQ />} />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      )}

      <TornadoAlertPopup />
      <OnboardingGate />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <div className="mx-auto h-screen w-full max-w-4xl overflow-hidden bg-background">
            <AuthenticatedApp />
          </div>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;