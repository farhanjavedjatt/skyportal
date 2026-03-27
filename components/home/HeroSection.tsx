"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const phrases = ["Every airport.", "Every flight.", "One search."];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const phraseVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroSection() {
  return (
    <div className="text-center">
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1]"
      >
        {phrases.map((phrase, i) => (
          <motion.span
            key={phrase}
            variants={phraseVariants}
            className={cn(
              "inline-block",
              i < phrases.length - 1 && "mr-3 sm:mr-4",
              i === phrases.length - 1
                ? "text-accent-blue"
                : "text-text-primary"
            )}
          >
            {phrase}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
      >
        Real-time flight data, airport information, and airline details
        &mdash; all in one place.
      </motion.p>
    </div>
  );
}
