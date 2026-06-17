export default function ProjectLoading() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-8 gap-2 border border-[#34322b] bg-[#181713] p-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-8" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-[#34322b] bg-[#181713] p-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-3 h-7 w-72" />
          <div className="mt-5 space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        </div>
        <div className="border border-[#34322b] bg-[#181713] p-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-7 w-48" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={["animate-pulse bg-[#2a2a28]", className].join(" ")} />;
}
