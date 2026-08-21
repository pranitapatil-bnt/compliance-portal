"use client";

import { authErrorMessage } from "@/constants/auth";
import { routes } from "@/constants/routes";

type LoginFormProps = {
  error?: string | null;
  from?: string | null;
};

export function LoginForm({ error, from }: LoginFormProps) {
  const message = authErrorMessage(error ?? undefined);

  return (
    <form
      action={routes.authLogin}
      method="get"
      className="flex flex-col gap-5"
    >
      {from ? <input type="hidden" name="from" value={from} /> : null}
      {message ? (
        <p className="text-sm font-medium text-navy" role="alert">
          {message}
        </p>
      ) : (
        <p className="text-sm text-navy-muted">
          You&apos;ll sign in with your ETHOS account on the next screen.
        </p>
      )}
      <button
        type="submit"
        className="mt-1 h-10 w-full rounded-lg bg-brand-gradient text-sm font-semibold text-white hover:opacity-90"
      >
        Sign In
      </button>
    </form>
  );
}
