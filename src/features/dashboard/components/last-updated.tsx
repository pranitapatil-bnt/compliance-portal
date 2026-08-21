"use client";

import { useState } from "react";

export function LastUpdated() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour12: false }),
  );

  return (
    <p className="text-sm leading-relaxed text-navy-muted">
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
