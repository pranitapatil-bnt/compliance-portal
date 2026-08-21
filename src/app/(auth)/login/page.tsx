import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BtLogo } from "@/components/layout/bt-logo";
import { routes } from "@/constants/routes";
import { LoginForm } from "@/features/auth";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; from?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect(routes.home);
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <section className="max-w-md justify-self-center lg:justify-self-end">
          <h1 className="text-4xl font-bold tracking-[0.14em] text-navy uppercase sm:text-5xl">
            ETHOS-INTERNAL
          </h1>
          <div className="mt-8 border-l-4 border-navy pl-5">
            <p className="text-base leading-relaxed text-navy-muted">
              Review onboarding checks, payment holds, and compliance queues
              from one desk.
            </p>
          </div>
        </section>

        <section className="flex justify-center lg:justify-start">
          <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_16px_48px_rgba(46,26,122,0.12)]">
            <div className="h-1 bg-navy" />
            <div className="px-10 py-9">
              <div className="mb-6 flex justify-center">
                <BtLogo className="h-12" />
              </div>
              <h2 className="mb-6 text-lg font-semibold text-navy">
                Sign in to your account
              </h2>
              <LoginForm error={params.error} from={params.from} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
