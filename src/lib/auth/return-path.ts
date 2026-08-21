import { routes } from "@/constants/routes";

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return routes.home;
  }

  if (value === routes.login || value.startsWith("/api/")) {
    return routes.home;
  }

  return value;
}
