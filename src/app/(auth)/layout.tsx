import type { ReactNode } from "react";

import { BtLogo } from "@/components/layout/bt-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-gradient px-4 py-12">
      <BtLogo className="relative z-10 mb-5 h-14 rounded-md bg-white px-3 py-2 shadow-sm" />
      <h1 className="relative z-10 mb-8 text-center text-sm font-semibold tracking-[0.28em] text-white uppercase">
        ETHOS-INTERNAL
      </h1>
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white px-10 py-9 shadow-[0_24px_60px_rgba(46,26,122,0.28)]">
        {children}
      </div>
    </div>
  );
}
