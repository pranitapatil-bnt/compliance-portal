import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { QueuePageBody } from "@/features/queues";
import type { QueueSearchParams } from "@/features/queues/types";

export const metadata: Metadata = {
  title: "Data Anonymisation",
};

export const dynamic = "force-dynamic";

export default function DataAnonPage({
  searchParams,
}: {
  searchParams: Promise<QueueSearchParams>;
}) {
  return (
    <>
      <PageHeader title="Data Anonymisation" />
      <QueuePageBody
        searchParams={searchParams}
        emptyTitle="No anonymisation requests"
        emptyDescription="Requests will appear here from /dataAnonQueue."
        variant="data-anon"
      />
    </>
  );
}
