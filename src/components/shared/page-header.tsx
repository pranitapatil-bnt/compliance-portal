type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold tracking-tight text-navy">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-sm text-navy-muted">{description}</p>
      ) : null}
    </div>
  );
}
