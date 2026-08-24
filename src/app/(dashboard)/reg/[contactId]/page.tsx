import type { Metadata } from "next";

import { getRegistrationDetails } from "@/features/registration-details/services/details-service";
import { RegistrationDetailsView } from "@/features/registration-details/components/registration-details-view";

export const metadata: Metadata = {
  title: "Client details",
};

export default async function RegistrationDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contactId: string }>;
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const { contactId } = await params;
  const query = await searchParams;
  const type = Array.isArray(query.type) ? query.type[0] : query.type;
  const details = await getRegistrationDetails(
    contactId,
    type?.trim() || "PERSONAL",
  );

  return <RegistrationDetailsView details={details} />;
}
