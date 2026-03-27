import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AirportDetailLoading() {
  return (
    <Container className="py-12">
      <Skeleton variant="rectangular" className="h-32 w-full rounded-2xl" />

      <Skeleton
        variant="rectangular"
        className="mt-6 h-12 w-full max-w-md rounded-xl"
      />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            className="h-48 rounded-2xl"
          />
        ))}
      </div>
    </Container>
  );
}
