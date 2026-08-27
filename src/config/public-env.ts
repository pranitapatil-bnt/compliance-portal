const DEFAULT_PORTAL_API_BASE = "http://172.31.2.23:8080/compliance-portal";

function normalizePortalBase(raw: string): string {
  try {
    const url = new URL(raw);
    const path = url.pathname.replace(/\/$/, "");
    if (!path || path === "/") {
      return `${url.origin}/compliance-portal`;
    }
    return `${url.origin}${path}`;
  } catch {
    return raw.replace(/\/$/, "") || DEFAULT_PORTAL_API_BASE;
  }
}

/** Browser-safe Java portal root. Shown in Network as the request URL. */
export function publicPortalApiBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_COMPLIANCE_API_BASE ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_PORTAL_API_BASE;
  return normalizePortalBase(raw);
}
