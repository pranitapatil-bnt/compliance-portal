"use client";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-zinc-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-zinc-600">{error.message}</p>
      <Button className="mt-6 w-fit" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
