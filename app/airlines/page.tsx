import { Suspense } from "react";
import type { Metadata } from "next";
import { Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Airline } from "@/lib/supabase/types";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { AirlineCard } from "@/components/airlines/AirlineCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { AirlinesFilter } from "./_components/AirlinesFilter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse Airlines",
  description:
    "Explore airlines worldwide. Filter by alliance, country, and status. View routes, fleet info, and hub airports.",
};

export default async function AirlinesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;

  const q = typeof sp.q === "string" ? sp.q : "";
  const alliance = typeof sp.alliance === "string" ? sp.alliance : "";
  const country = typeof sp.country === "string" ? sp.country : "";
  const active = typeof sp.active === "string" ? sp.active : "";

  const supabase = await createClient();
  let query = supabase.from("airlines").select("*");

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,iata_code.ilike.%${q}%,icao_code.ilike.%${q}%,country.ilike.%${q}%`
    );
  }
  if (alliance) {
    query = query.eq("alliance", alliance);
  }
  if (country) {
    query = query.ilike("country", `%${country}%`);
  }
  if (active === "true") {
    query = query.eq("is_active", true);
  } else if (active === "false") {
    query = query.eq("is_active", false);
  }

  const { data: airlines, error } = await query.order("name");
  const results = (airlines as Airline[] | null) ?? [];

  return (
    <Container className="py-10 sm:py-14">
      <PageTransition>
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Airlines
          </h1>
          <p className="text-text-secondary">
            Browse{" "}
            {results.length > 0
              ? `${results.length.toLocaleString()} `
              : ""}
            airlines worldwide
          </p>
        </div>

        <div className="mb-8">
          <Suspense>
            <AirlinesFilter />
          </Suspense>
        </div>

        {error ? (
          <EmptyState
            title="Something went wrong"
            message="Unable to load airlines. Please try again later."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No airlines found"
            message={
              q || alliance || country || active
                ? "Try adjusting your filters to find what you're looking for."
                : "No airline data is available at this time."
            }
            icon={<Plane className="h-7 w-7" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((airline) => (
              <AirlineCard key={airline.id} airline={airline} />
            ))}
          </div>
        )}
      </PageTransition>
    </Container>
  );
}
