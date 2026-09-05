import { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import { NavigationStackProvider } from "@/lib/NavigationStack";
import { RadioProvider } from "@/lib/RadioContext";
import OnboardingModal from "@/components/radar/OnboardingModal";

const Radar = lazy(() => import("./pages/Radar"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Hourly = lazy(() => import("./pages/Hourly"));
const Daily = lazy(() => import("./pages/Daily"));
const RadioPage = lazy(() => import("./pages/Radio"));
const Globe = lazy(() => import("./pages/Globe"));
const Landing = lazy(() => import("./pages/Landing"));
const Privacy = lazy(() => import("./pages/Privacy"));

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
  </div>
);

const AppRoutes = () => {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarded_v1"));

  return (
    <>
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="h-full"
        >
          <Suspense fallback={<Spinner />}>
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/landing" replace />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/Radar" element={<Radar />} />
              <Route path="/Forecast" element={<Forecast />} />
              <Route path="/Hourly" element={<Hourly />} />
              <Route path="/Daily" element={<Daily />} />
              <Route path="/Radio" element={<RadioPage />} />
              <Route path="/Globe" element={<Globe />} />
              <Route path="/Contacts" element={<Contacts />} />
              <Route path="/Settings" element={<Settings />} />
              <Route path="/Privacy" element={<Privacy />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationStackProvider>
            <RadioProvider>
            <div className="mx-auto h-[100dvh] w-full max-w-4xl overflow-hidden bg-[#0a0d12] text-white">
              <AppRoutes />
            </div>
            <Toaster />
            </RadioProvider>
          </NavigationStackProvider>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
