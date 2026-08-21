import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ id, label, error, className, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-navy">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-navy-line px-3 py-2 text-sm text-navy outline-none focus:border-navy",
          error && "border-navy",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm font-medium text-navy">{error}</p> : null}
    </div>
  );
}
