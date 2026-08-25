"use client";

import { useRouter } from "next/navigation";

type LastUpdatedProps = {
  time?: string;
};

export function LastUpdated({ time }: LastUpdatedProps) {
  const router = useRouter();

  return (
    <p className="text-sm leading-relaxed text-navy-muted">
      Last updated @ {time || "--:--:--"}{" "}
      <button
        type="button"
        className="font-semibold text-navy hover:underline"
        onClick={() => router.refresh()}
      >
        Refresh
      </button>
    </p>
  );
}
