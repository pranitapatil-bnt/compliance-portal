import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-[0_10px_28px_rgba(15,40,70,0.06)]",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
