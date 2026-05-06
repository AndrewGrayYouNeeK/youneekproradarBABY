import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function RefreshSpinner({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 safe-top"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-background/90 shadow-lg backdrop-blur">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}