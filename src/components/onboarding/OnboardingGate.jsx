import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingTour from "./OnboardingTour";

const KEY = "yk_onboarding_v1_seen";

export default function OnboardingGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const close = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && <OnboardingTour onClose={close} />}
    </AnimatePresence>
  );
}