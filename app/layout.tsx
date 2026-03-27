import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkyPortal — Every Airport. Every Flight. One Search.",
    template: "%s | SkyPortal",
  },
  description:
    "Browse airports worldwide, search flights by number or route, and view real-time departure and arrival boards. Your comprehensive aviation information portal.",
  keywords: [
    "airports",
    "flights",
    "airlines",
    "flight status",
    "departure board",
    "arrival board",
    "FIDS",
    "aviation",
  ],
  openGraph: {
    type: "website",
    siteName: "SkyPortal",
    title: "SkyPortal — Every Airport. Every Flight. One Search.",
    description:
      "Browse airports worldwide, search flights by number or route, and view real-time departure and arrival boards.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyPortal",
    description:
      "Your comprehensive aviation information portal. Airports, airlines, flights — all in one place.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://skyportal.dev"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
