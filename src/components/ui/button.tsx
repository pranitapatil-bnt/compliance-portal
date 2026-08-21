import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-gradient text-white hover:opacity-90 disabled:opacity-50",
  secondary:
    "border border-navy-line bg-white text-navy hover:bg-navy-wash",
  ghost: "text-navy hover:bg-navy-soft",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
