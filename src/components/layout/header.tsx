import type { Session } from "@/lib/auth/types";

import { AppHeader } from "./app-header";

type HeaderProps = {
  session: Session | null;
};

export function Header({ session }: HeaderProps) {
  if (!session) {
    return null;
  }

  return <AppHeader session={session} />;
}
