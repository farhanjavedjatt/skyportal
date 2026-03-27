import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { AirportsFilter } from "@/components/airports/AirportsFilter";
import { AirportList } from "@/components/airports/AirportList";
import type { Airport } from "@/lib/supabase/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse Airports",
  description:
    "Search and browse airports worldwide. Filter by country, find major hubs, and discover airport details including contact info, terminals, and live flight boards.",
};

const PAGE_SIZE = 50;

interface AirportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AirportsPage(props: AirportsPageProps) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const country =
    typeof searchParams.country === "string" ? searchParams.country : "";
  const major = searchParams.major === "true";

  const supabase = await createClient();

  // Distinct countries for filter dropdown
  const { data: countriesRaw } = await supabase
    .from("airports")
    .select("*")
    .order("country");

  const countryMap = new Map<string, string>();
  (countriesRaw as Airport[] | null)?.forEach((a) => {
    if (!countryMap.has(a.country_code)) {
      countryMap.set(a.country_code, a.country);
    }
  });
  const countries = Array.from(countryMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filtered airports query
  let query = supabase.from("airports").select("*");

  if (q) {
    query = query.textSearch("search_vector", q);
  }
  if (country) {
    query = query.eq("country_code", country);
  }
  if (major) {
    query = query.eq("is_major", true);
  }

  const { data } = await query.order("name").range(0, PAGE_SIZE - 1);

  const airports = (data ?? []) as Airport[];
  const hasMore = airports.length >= PAGE_SIZE;

  return (
    <PageTransition>
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
            Browse Airports
          </h1>
          <p className="mt-2 text-text-secondary">
            Explore airports worldwide &mdash; search by name, city, or IATA
            code
          </p>
        </div>

        <AirportsFilter
          key={`filter-${q}-${country}-${major}`}
          countries={countries}
          initialQuery={q}
          initialCountry={country}
          initialMajor={major}
        />

        <AirportList
          key={`list-${q}-${country}-${major}`}
          initialAirports={airports}
          hasMore={hasMore}
          searchQuery={q || undefined}
          country={country || undefined}
          major={major || undefined}
        />
      </Container>
    </PageTransition>
  );
}
