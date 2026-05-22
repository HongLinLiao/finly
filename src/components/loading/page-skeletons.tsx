import { Skeleton } from "@/components/ui/skeleton";

function PageHeaderSkeleton({
  action = false,
  subtitle = true,
  titleWidth = "w-32",
}: {
  action?: boolean;
  subtitle?: boolean;
  titleWidth?: string;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className={`h-8 ${titleWidth}`} />
        {subtitle ? <Skeleton className="h-4 w-full max-w-md" /> : null}
      </div>
      {action ? <Skeleton className="h-10 w-28 rounded-xl" /> : null}
    </header>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
  );
}

function SimpleRowSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-44 max-w-[60vw]" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <section className="space-y-6" aria-label="Loading dashboard">
      <section className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SummaryCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="rounded-2xl border bg-card p-4">
          <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
            <Skeleton className="aspect-square w-full rounded-full" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export function HoldingPageSkeleton() {
  return (
    <section className="space-y-5" aria-label="Loading holdings">
      <PageHeaderSkeleton />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SimpleRowSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function BrokerageSettingsPageSkeleton() {
  return (
    <section className="space-y-5" aria-label="Loading brokerage settings">
      <PageHeaderSkeleton subtitle={false} titleWidth="w-28" />

      <div className="grid grid-cols-2 gap-2 sm:max-w-md">
        {Array.from({ length: 2 }).map((_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <SimpleRowSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function CashMovementRecordsPageSkeleton() {
  return (
    <section className="space-y-5" aria-label="Loading cash movement records">
      <PageHeaderSkeleton action titleWidth="w-36" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 14 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border bg-card p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <SimpleRowSkeleton key={index} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
