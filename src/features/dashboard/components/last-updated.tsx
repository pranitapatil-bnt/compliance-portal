"use client";

import { useEffect, useState } from "react";

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

export function LastUpdated() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(nowTime());
  }, []);

  return (
    <p className="text-sm leading-relaxed text-navy-muted">
      Last updated @ {time ?? "--:--:--"}{" "}
      <button
        type="button"
        className="font-semibold text-navy hover:underline"
        onClick={() => setTime(nowTime())}
      >
        Refresh
      </button>
    </p>
  );
}
