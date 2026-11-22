export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-4 p-4 sm:p-6" aria-busy="true" aria-label="Loading page">
      <div className="vms-skeleton h-8 w-64" />
      <div className="vms-skeleton h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="vms-card space-y-3 p-4">
            <div className="vms-skeleton h-3 w-24" />
            <div className="vms-skeleton h-8 w-20" />
            <div className="vms-skeleton h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="vms-card h-72 lg:col-span-2" />
        <div className="vms-card h-72" />
      </div>
    </div>
  );
}
