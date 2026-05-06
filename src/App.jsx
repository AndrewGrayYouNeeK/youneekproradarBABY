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

const Radar = lazy(() => import("./pages/Radar"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Radio = lazy(() => import("./pages/Radio"));
const Safety = lazy(() => import("./pages/Safety"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const Locations = lazy(() => import("./pages/Locations"));

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
  </div>
);

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="h-full"
      >
        <Suspense fallback={<Spinner />}>
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/Radar" replace />} />
            <Route path="/Radar" element={<Radar />} />
            <Route path="/Forecast" element={<Forecast />} />
            <Route path="/Alerts" element={<Alerts />} />
            <Route path="/Radio" element={<Radio />} />
            <Route path="/Safety" element={<Safety />} />
            <Route path="/Contacts" element={<Contacts />} />
            <Route path="/Locations" element={<Locations />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
      <TornadoAlertPopup />
    </AnimatePresence>
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