import type { ReactNode } from "react";

import { checkStatusLabel, parseCheckStatus } from "../check-status";
import type { CheckStatus } from "../types";

function PassIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <path
        d="M8.1 13.4 4.8 10.1l1.2-1.2 2.1 2.1 5.9-5.9 1.2 1.2z"
        fill="#1f9d55"
      />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <path
        d="M14.2 6.2 10.4 10l3.8 3.8-1.2 1.2L9.2 11.2 5.4 15 4.2 13.8 8 10 4.2 6.2 5.4 5l3.8 3.8L13 5z"
        fill="#d64545"
      />
    </svg>
  );
}

function NaIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="6.2"
        fill="none"
        stroke="#8b93a7"
        strokeWidth="1.6"
      />
      <path d="M5.6 14.4 14.4 5.6" stroke="#8b93a7" strokeWidth="1.6" />
    </svg>
  );
}

const icons: Record<CheckStatus, () => ReactNode> = {
  pass: PassIcon,
  fail: FailIcon,
  na: NaIcon,
};

export function CheckStatusIcon({ value }: { value: string }) {
  const status = parseCheckStatus(value);
  const Icon = icons[status];

  return (
    <span
      title={checkStatusLabel(status)}
      className="inline-flex items-center justify-center"
    >
      <Icon />
    </span>
  );
}
