export function QueueTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
      <div className="border-b border-slate-100 bg-[#f7fbfe] px-4 py-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#d7e6f4]" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex gap-3 px-4 py-3">
            <div className="h-3 w-[12%] animate-pulse rounded bg-[#eef3f7]" />
            <div className="h-3 w-[18%] animate-pulse rounded bg-[#eef3f7]" />
            <div className="h-3 w-[10%] animate-pulse rounded bg-[#eef3f7]" />
            <div className="h-3 flex-1 animate-pulse rounded bg-[#eef3f7]" />
            <div className="h-3 w-[12%] animate-pulse rounded bg-[#eef3f7]" />
          </div>
        ))}
      </div>
      <p className="px-4 py-3 text-sm text-navy-muted">Loading records…</p>
    </div>
  );
}
