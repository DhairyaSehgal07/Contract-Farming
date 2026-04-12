import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-8 sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-8 w-44 max-w-full sm:w-52" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-full max-w-md sm:hidden" />
        </div>
        <Skeleton className="h-9 w-full shrink-0 rounded-md sm:w-36" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="flex gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:gap-4 sm:px-5">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 flex-1 sm:block" />
          <Skeleton className="h-4 w-16 shrink-0 sm:w-20" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
            >
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="hidden h-5 flex-1 sm:block" />
              <Skeleton className="h-8 w-16 shrink-0 sm:w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
