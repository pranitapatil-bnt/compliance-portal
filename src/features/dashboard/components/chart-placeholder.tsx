type ChartPlaceholderProps = {
  kind?: "bar" | "donut";
};

export function ChartPlaceholder({ kind = "bar" }: ChartPlaceholderProps) {
  if (kind === "donut") {
    return (
      <div className="flex h-40 items-center justify-center">
        <div
          className="size-28 rounded-full"
          style={{
            background:
              "conic-gradient(#2e1a7a 0 35%, #5ba4e5 35% 70%, #e3f1fb 70% 100%)",
            mask: "radial-gradient(farthest-side, transparent 52%, #000 53%)",
            WebkitMask: "radial-gradient(farthest-side, transparent 52%, #000 53%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-36 items-end justify-center gap-3 px-6 pb-2">
      {[40, 70, 55, 90, 35, 62].map((height, index) => (
        <span
          key={index}
          className="w-6 rounded-t-sm bg-navy-mid"
          style={{ height: `${height}%`, opacity: 0.35 + index * 0.1 }}
        />
      ))}
    </div>
  );
}
