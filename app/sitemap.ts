import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Airport, Airline } from "@/lib/supabase/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://skyportal.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: airportsRaw }, { data: airlinesRaw }] = await Promise.all([
    supabase.from("airports").select("*"),
    supabase.from("airlines").select("*"),
  ]);

  const airports = (airportsRaw ?? []) as Airport[];
  const airlines = (airlinesRaw ?? []) as Airline[];

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/airports`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/airlines`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/flights`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const airportRoutes: MetadataRoute.Sitemap = airports.flatMap(
    (airport) => [
      {
        url: `${BASE_URL}/airports/${airport.slug}`,
        lastModified: new Date(airport.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/airports/${airport.slug}/departures`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/airports/${airport.slug}/arrivals`,
        lastModified: now,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      },
    ]
  );

  const airlineRoutes: MetadataRoute.Sitemap = airlines.map(
    (airline) => ({
      url: `${BASE_URL}/airlines/${airline.slug}`,
      lastModified: new Date(airline.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...airportRoutes, ...airlineRoutes];
}
