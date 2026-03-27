import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { FlightSearchForm } from "@/components/flights/FlightSearchForm";

export const metadata: Metadata = {
  title: "Flight Search — Track Any Flight",
  description:
    "Search for any flight by number and track its real-time status, including delays, gate information, and arrival times.",
};

export default function FlightsPage() {
  return (
    <Container className="py-20 sm:py-28">
      <PageTransition>
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-text-primary mb-3">
            Track Any Flight
          </h1>
          <p className="text-text-secondary text-lg max-w-md">
            Enter a flight number to get real-time status, gate information, and
            delay alerts.
          </p>
        </div>
        <FlightSearchForm />
      </PageTransition>
    </Container>
  );
}
