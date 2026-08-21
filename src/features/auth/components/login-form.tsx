"use client";

import { demoCredentials } from "@/constants/auth";

import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const [state, formAction, isPending] = useLogin();

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-[13px] font-medium text-navy">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          defaultValue={demoCredentials.username}
          required
          className="h-10 rounded-lg border border-navy-line bg-white px-3 text-sm text-navy outline-none focus:border-navy"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-navy">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-lg border border-navy-line bg-white px-3 text-sm text-navy outline-none focus:border-navy"
        />
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-navy" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 h-10 w-full rounded-lg bg-brand-gradient text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
