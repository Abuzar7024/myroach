"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { getAndClearReturnUrl } from "@/lib/auth-utils";

const GENZ_LINES = [
  "loading your main character arc…",
  "roach energy initializing…",
  "drip calibration at 100%…",
  "no cap, you're in now 🔥",
];

export function WelcomeSplash() {
  const { showWelcomeSplash, pendingDisplayName, user, dismissWelcomeSplash } = useAuth();
  const router = useRouter();
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!showWelcomeSplash) return;
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % GENZ_LINES.length);
    }, 900);
    const timeout = setTimeout(() => {
      dismissWelcomeSplash();
      router.push(getAndClearReturnUrl("/shop"));
    }, 3200);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showWelcomeSplash, dismissWelcomeSplash, router]);

  const name = pendingDisplayName || user?.displayName || "friend";

  return (
    <AnimatePresence>
      {showWelcomeSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-noire-black"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl text-accent-cyan sm:text-5xl [text-shadow:0_0_24px_rgba(0,240,255,0.4)]"
          >
            hello, {name}
          </motion.p>
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-sm uppercase tracking-[0.25em] text-accent-pink"
          >
            {GENZ_LINES[lineIndex]}
          </motion.p>
          <div className="mt-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-accent-cyan"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
