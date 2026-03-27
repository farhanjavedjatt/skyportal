import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FlightDetailLoading() {
  return (
    <Container className="py-12">
      <Skeleton variant="rectangular" className="h-12 w-48 rounded-xl" />

      <Skeleton
        variant="rectangular"
        className="mt-6 h-32 w-full rounded-2xl"
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton variant="rectangular" className="h-56 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-56 rounded-2xl" />
      </div>

      <Skeleton
        variant="rectangular"
        className="mt-8 h-64 w-full rounded-2xl"
      />
    </Container>
  );
}
