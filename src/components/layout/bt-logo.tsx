import { cn } from "@/lib/utils/cn";

type BtLogoProps = {
  className?: string;
};

export function BtLogo({ className }: BtLogoProps) {
  return (
    <img
      src="/bt-logo.png"
      alt="B&T"
      className={cn("h-9 w-auto", className)}
    />
  );
}
