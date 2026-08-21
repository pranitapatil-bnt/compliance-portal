type Stat = {
  label: string;
  value: number | string;
  unit: string;
  href?: boolean;
};

type StatRowProps = {
  items: readonly Stat[];
};

export function StatRow({ items }: StatRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="mb-1 text-[11px] font-medium text-navy-muted">
            {item.href ? (
              <span className="cursor-pointer text-navy hover:underline">
                {item.label}
              </span>
            ) : (
              item.label
            )}
          </p>
          <p className="text-sm text-navy">
            {item.value}{" "}
            <span className="text-xs text-navy-muted">{item.unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
