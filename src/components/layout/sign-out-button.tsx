import { routes } from "@/constants/routes";

type SignOutButtonProps = {
  email: string;
  compact?: boolean;
};

export function SignOutButton({ email, compact = false }: SignOutButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {compact ? null : (
        <span className="hidden truncate text-white/80 sm:inline">{email}</span>
      )}
      <a
        href={routes.logout}
        className={
          compact
            ? "inline-flex w-full items-center justify-center rounded-lg border border-navy-line bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy-wash"
            : "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
        }
      >
        Sign out
      </a>
    </div>
  );
}
