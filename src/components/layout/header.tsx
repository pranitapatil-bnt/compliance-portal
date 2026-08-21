import type { Session } from "@/lib/auth/types";

import { AppHeader } from "./app-header";

type HeaderProps = {
  session: Session | null;
  today: string;
  onMenu: () => void;
};

export function Header({ session, today, onMenu }: HeaderProps) {
  if (!session) {
    return null;
  }

  return <AppHeader session={session} today={today} onMenu={onMenu} />;
}
