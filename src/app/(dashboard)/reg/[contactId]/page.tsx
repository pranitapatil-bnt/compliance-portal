import type { Metadata } from "next";

import { getRegistrationDetails } from "@/features/registration-details/services/details-service";
import { RegistrationDetailsView } from "@/features/registration-details/components/registration-details-view";

export const metadata: Metadata = {
  title: "Client details",
};

export const dynamic = "force-dynamic";

function first(value?: string | string[]): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

export default async function RegistrationDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contactId: string }>;
  searchParams: Promise<{
    type?: string | string[];
    accountId?: string | string[];
    org?: string | string[];
    lockId?: string | string[];
    status?: string | string[];
  }>;
}) {
  const { contactId } = await params;
  const query = await searchParams;
  const details = await getRegistrationDetails(contactId, {
    type: first(query.type),
    accountId: first(query.accountId),
    org: first(query.org),
    lockId: first(query.lockId),
    status: first(query.status),
  });

  return <RegistrationDetailsView details={details} />;
}
