import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Holistic view",
};

export default function HolisticReportPage() {
  return (
    <>
      <PageHeader
        title="Holistic view"
        description="Search a client and open their 360° profile, payments, and checks."
      />
      <p className="mb-4 rounded-2xl bg-[#e7f3fc] px-4 py-2.5 text-sm text-navy">
        UI only — client search is not connected yet.
      </p>
      <form className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
        <input
          type="search"
          placeholder="Client name, email, or account"
          disabled
          className="min-w-64 flex-1 rounded-lg border border-navy-line bg-white px-3 py-2 text-sm text-navy-muted"
        />
        <button
          type="button"
          disabled
          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white opacity-50"
        >
          Search
        </button>
      </form>
      <EmptyState
        title="No client selected"
        description="Search results will open personal or corporate holistic details."
      />
    </>
  );
}
