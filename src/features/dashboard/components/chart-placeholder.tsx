import type { FulfilmentSlice, LegalEntityRow } from "../data";

type ChartPlaceholderProps = {
  kind?: "bar" | "donut";
  compact?: boolean;
  bars?: readonly LegalEntityRow[];
  slices?: readonly FulfilmentSlice[];
};

function barHeights(bars: readonly LegalEntityRow[]): number[] {
  if (bars.length === 0) {
    return [];
  }
  const max = Math.max(...bars.map((bar) => bar.visits), 1);
  return bars.slice(0, 8).map((bar) => Math.max(8, Math.round((bar.visits / max) * 100)));
}

function donutGradient(slices: readonly FulfilmentSlice[]): string {
  const fulfilled =
    slices.find((slice) => /fulfil/i.test(slice.title))?.value ??
    slices[0]?.value ??
    0;
  const remaining =
    slices.find((slice) => /remain/i.test(slice.title))?.value ??
    slices[1]?.value ??
    0;
  const total = fulfilled + remaining;
  if (total <= 0) {
    return "conic-gradient(#e3f1fb 0 100%)";
  }
  const fulfilledPct = Math.round((fulfilled / total) * 100);
  return `conic-gradient(#2e1a7a 0 ${fulfilledPct}%, #5ba4e5 ${fulfilledPct}% 100%)`;
}

export function ChartPlaceholder({
  kind = "bar",
  compact = false,
  bars = [],
  slices = [],
}: ChartPlaceholderProps) {
  if (kind === "donut") {
    return (
      <div
        className={
          compact
            ? "flex h-24 items-center justify-center"
            : "flex h-40 items-center justify-center"
        }
      >
        <div
          className={compact ? "size-20 rounded-full" : "size-28 rounded-full"}
          style={{
            background: donutGradient(slices),
            mask: "radial-gradient(farthest-side, transparent 52%, #000 53%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent 52%, #000 53%)",
          }}
        />
      </div>
    );
  }

  const heights = barHeights(bars);

  return (
    <div
      className={
        compact
          ? "flex h-20 items-end justify-center gap-2 px-3 pb-1"
          : "flex h-36 items-end justify-center gap-3 px-6 pb-2"
      }
    >
      {heights.length === 0 ? (
        <span className="h-2 w-full max-w-40 rounded-sm bg-slate-100" />
      ) : (
        heights.map((height, index) => (
          <span
            key={`${bars[index]?.legalEntity ?? index}-${height}`}
            className={
              compact
                ? "w-3.5 rounded-t-sm bg-navy-mid"
                : "w-6 rounded-t-sm bg-navy-mid"
            }
            style={{ height: `${height}%`, opacity: 0.45 + index * 0.08 }}
            title={
              bars[index]
                ? `${bars[index].legalEntity}: ${bars[index].visits}`
                : undefined
            }
          />
        ))
      )}
    </div>
  );
}
