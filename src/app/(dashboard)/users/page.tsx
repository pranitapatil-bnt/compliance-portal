import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { UserList } from "@/features/users";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Directory data is loaded in a Server Component via the users feature service."
      />
      <UserList />
    </>
  );
}
