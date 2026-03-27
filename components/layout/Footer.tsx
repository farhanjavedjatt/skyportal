import Link from "next/link";
import { Plane } from "lucide-react";

const footerLinks = {
  Explore: [
    { href: "/airports", label: "Airports" },
    { href: "/airlines", label: "Airlines" },
    { href: "/flights", label: "Flight Search" },
  ],
  Resources: [
    { href: "/airports?major=true", label: "Major Airports" },
    { href: "/airlines?alliance=Star+Alliance", label: "Star Alliance" },
    { href: "/airlines?alliance=oneworld", label: "oneworld" },
    { href: "/airlines?alliance=SkyTeam", label: "SkyTeam" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue text-white">
                <Plane className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold text-text-primary">
                SkyPortal
              </span>
            </Link>
            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
              Your comprehensive aviation information portal. Browse airports,
              search flights, and view real-time departure and arrival boards
              worldwide.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} SkyPortal. Flight data powered by
            AeroDataBox.
          </p>
          <p className="text-xs text-text-tertiary">
            Built with Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
