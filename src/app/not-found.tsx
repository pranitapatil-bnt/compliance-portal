import Link from "next/link";

import { routes } from "@/constants/routes";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-zinc-900">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-600">
        The page you requested does not exist.
      </p>
      <Link
        href={routes.home}
        className="mt-6 text-sm font-medium text-zinc-900 underline"
      >
        Back home
      </Link>
    </main>
  );
}
