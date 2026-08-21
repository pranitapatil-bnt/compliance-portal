type WorkQueueScreenProps = {
  columns: readonly string[];
  emptyTitle: string;
  emptyDescription: string;
  showExport?: boolean;
};

export function WorkQueueScreen({
  columns,
  emptyTitle,
  emptyDescription,
  showExport = false,
}: WorkQueueScreenProps) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-navy-line bg-navy-soft px-3 py-2 text-sm text-navy">
        UI only — queues are not connected to the Java APIs yet.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-line bg-white px-4 py-3">
        <p className="text-sm text-navy-muted">
          <strong className="font-semibold text-navy">0</strong> records
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Keyword"
            disabled
            className="w-44 rounded-lg border border-navy-line bg-white px-3 py-1.5 text-sm text-navy-muted"
          />
          <select
            disabled
            className="rounded-lg border border-navy-line bg-white px-3 py-1.5 text-sm text-navy-muted"
            defaultValue=""
          >
            <option value="">All statuses</option>
          </select>
          <button
            type="button"
            disabled
            className="rounded-lg bg-navy px-3 py-1.5 text-sm font-medium text-white opacity-50"
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
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-line bg-navy-wash text-xs font-semibold tracking-[0.08em] text-navy-muted uppercase">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-navy">{emptyTitle}</p>
                <p className="mt-1 text-sm text-navy-muted">{emptyDescription}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
