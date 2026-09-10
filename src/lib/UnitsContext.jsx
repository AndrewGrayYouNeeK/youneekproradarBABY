import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_UNITS, loadUnits, saveUnits } from "@/lib/units";

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [units, setUnitsState] = useState(() => (typeof window === "undefined" ? DEFAULT_UNITS : loadUnits()));

  const value = useMemo(() => ({
    units,
    setUnits: (next) => {
      const resolved = typeof next === "function" ? next(units) : { ...units, ...next };
      setUnitsState(resolved);
      saveUnits(resolved);
    },
  }), [units]);

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
}
