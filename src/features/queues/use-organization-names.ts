"use client";

import { useEffect, useState } from "react";

import { complianceBffGet } from "@/lib/compliance/browser";

import { readOrgLabels } from "./mappers";

export function useOrganizationNames(): string[] {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void complianceBffGet<unknown>("organizations")
      .then((payload) => {
        if (!cancelled) {
          setNames(readOrgLabels(payload));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNames([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return names;
}
