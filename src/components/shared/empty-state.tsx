type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-line bg-white px-6 py-12 text-center">
      <h2 className="text-sm font-medium text-navy">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-navy-muted">{description}</p>
      ) : null}
    </div>
  );
}
