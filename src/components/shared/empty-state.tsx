type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-[0_10px_28px_rgba(15,40,70,0.06)]">
      <h2 className="text-sm font-medium text-navy">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-navy-muted">{description}</p>
      ) : null}
    </div>
  );
}
