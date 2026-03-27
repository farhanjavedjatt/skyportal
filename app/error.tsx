"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, Home } from "lucide-react";
import { Container } from "@/components/layout/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-red/10">
          <span className="text-3xl">!</span>
        </div>

        <h1 className="font-heading mt-6 text-3xl font-bold text-text-primary">
          Something went wrong
        </h1>

        <p className="mt-3 text-text-secondary">
          An unexpected error occurred. You can try again or head back to the
          homepage.
        </p>

        {error.message && (
          <pre className="mt-6 overflow-x-auto rounded-xl border border-border-subtle bg-bg-secondary p-4 text-left text-sm text-accent-red font-mono">
            <code>{error.message}</code>
          </pre>
        )}

        {error.digest && (
          <p className="mt-2 text-xs text-text-tertiary">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-blue/80"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-blue/40 hover:text-accent-blue"
          >
            <Home className="h-4 w-4" />
            Homepage
          </Link>
        </div>
      </motion.div>
    </Container>
  );
}
