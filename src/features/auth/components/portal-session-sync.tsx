"use client";

import { useEffect } from "react";

export function PortalSessionSync() {
  useEffect(() => {
    void fetch("/api/auth/portal-session", { credentials: "include" });
  }, []);

  return null;
}
