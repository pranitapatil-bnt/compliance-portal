import type { QueueResult } from "@/features/queues/types";

const defaultStatuses = [
  { value: "HOLD", label: "HOLD" },
  { value: "FAILED", label: "Failed" },
  { value: "CLEARED", label: "Cleared" },
  { value: "REJECTED", label: "Rejected" },
] as const;

type WorkQueueScreenProps = {
  columns: readonly string[];
  result: QueueResult;
  keyword?: string;
  status?: string;
  emptyTitle: string;
  emptyDescription: string;
  showExport?: boolean;
  statuses?: readonly { value: string; label: string }[];
};

export function WorkQueueScreen({
  columns,
  result,
  keyword = "",
  status = "",
  emptyTitle,
  emptyDescription,
  showExport = false,
  statuses = defaultStatuses,
}: WorkQueueScreenProps) {
  return (
    <div className="space-y-4">
      {result.error ? (
        <p className="rounded-2xl bg-[#fdecec] px-4 py-2.5 text-sm text-navy">
          {result.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
        <p className="text-sm text-navy-muted">
          <strong className="font-semibold text-navy">{result.total}</strong>{" "}
          records
        </p>
        <form className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            name="keyword"
            defaultValue={keyword}
            placeholder="Keyword"
            className="w-44 rounded-lg border border-navy-line bg-white px-3 py-1.5 text-sm text-navy"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-navy-line bg-white px-3 py-1.5 text-sm text-navy"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-white"
          >
            Search
          </button>
          {showExport ? (
            <button
              type="button"
              disabled
              className="rounded-lg border border-navy-line bg-white px-3 py-1.5 text-sm font-medium text-navy opacity-50"
            >
              Download Excel
            </button>
          ) : null}
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-[#f7fbfe] text-xs font-semibold tracking-[0.08em] text-navy-muted uppercase">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-navy">{emptyTitle}</p>
                  <p className="mt-1 text-sm text-navy-muted">
                    {emptyDescription}
                  </p>
                </td>
              </tr>
            ) : (
              result.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  {columns.map((column, index) => (
                    <td key={column} className="px-4 py-3 text-navy">
                      {row.cells[index] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
