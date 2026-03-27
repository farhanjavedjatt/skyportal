import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen">
      <Skeleton variant="rectangular" className="h-16 w-full rounded-none" />

      <Skeleton variant="rectangular" className="h-[400px] w-full rounded-none" />

      <Container className="py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              className="h-56 rounded-2xl"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
