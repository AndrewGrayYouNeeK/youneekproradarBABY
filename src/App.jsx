import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import { NavigationStackProvider } from "@/lib/NavigationStack";
import { RadioProvider } from "@/lib/RadioContext";
import useSiteConfig from "@/hooks/useSiteConfig";
import { homePathForRole } from "@/lib/sites";

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
  <div className="fixed inset-0 flex items-center justify-center bg-[#4DA6EA]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/40 border-t-white" />
  </div>
);

function HomeGate() {
  const { role } = useSiteConfig();
  return <Navigate to={homePathForRole(role)} replace />;
}

const AppRoutes = () => {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="h-full"
        >
          <Suspense fallback={<Spinner />}>
            <Routes location={location}>
              <Route path="/" element={<HomeGate />} />
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
            <div className="mx-auto h-[100dvh] w-full max-w-4xl overflow-hidden bg-[#4DA6EA] text-white">
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
