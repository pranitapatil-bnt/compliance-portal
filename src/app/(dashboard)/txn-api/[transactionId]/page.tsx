import type { Metadata } from "next";

import { TxnApiDetailsLoader } from "@/features/txn-api-details/components/txn-api-details-loader";

export const metadata: Metadata = {
  title: "Transaction details",
};

export const dynamic = "force-dynamic";

function first(value?: string | string[]): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

export default async function TxnApiDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ transactionId: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { transactionId } = await params;
  const query = await searchParams;
  const decoded = decodeURIComponent(transactionId);
  const source = first(query.from) === "report" ? "REPORT" : "QUEUE";

  return <TxnApiDetailsLoader transactionId={decoded} source={source} />;
}
