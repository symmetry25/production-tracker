export default function AppLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-5">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-[520px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <PanelSkeleton />
        <PanelSkeleton compact />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <PanelSkeleton compact />
        <PanelSkeleton compact />
        <PanelSkeleton compact />
      </div>
    </div>
  );
}

function PanelSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border border-[#34322b] bg-[#181713] p-4">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-6 w-56" />
      <div className={["mt-5 grid gap-3", compact ? "grid-cols-2" : "grid-cols-3"].join(" ")}>
        {Array.from({ length: compact ? 4 : 9 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={["animate-pulse bg-[#2a2a28]", className].join(" ")} />;
}
