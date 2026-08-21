"use client";

import { useState } from "react";

export function LastUpdated() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour12: false }),
  );

  return (
    <p className="rounded-full border border-navy-line bg-white px-3 py-1.5 text-sm text-navy-muted">
      Last updated @ {time}{" "}
      <button
        type="button"
        className="font-semibold text-navy hover:underline"
        onClick={() =>
          setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }))
        }
      >
        Refresh
      </button>
    </p>
  );
}
