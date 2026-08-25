import { QueueTableSkeleton } from "@/features/queues/components/queue-table-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-56 animate-pulse rounded bg-navy-soft" />
      <QueueTableSkeleton />
    </div>
  );
}
