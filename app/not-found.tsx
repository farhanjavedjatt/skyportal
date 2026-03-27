"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Plane, Navigation } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/ui/SearchBar";

const quickLinks = [
  { href: "/airports", label: "Browse Airports", icon: Building2 },
  { href: "/airlines", label: "Browse Airlines", icon: Plane },
  { href: "/flights", label: "Search Flights", icon: Navigation },
];

export default function NotFound() {
  return (
    <Container className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl text-center"
      >
        <p className="font-heading text-[10rem] font-black leading-none text-accent-blue/20 select-none sm:text-[12rem]">
          404
        </p>

        <h1 className="font-heading -mt-8 text-3xl font-bold text-text-primary sm:text-4xl">
          Page Not Found
        </h1>

        <p className="mt-4 text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8">
          <SearchBar className="max-w-md mx-auto" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-blue/40 hover:text-accent-blue"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-accent-blue hover:underline"
        >
          &larr; Back to Home
        </Link>
      </motion.div>
    </Container>
  );
}
