type WorldMapProps = {
  highlight?: boolean;
  id?: string;
};

export function WorldMap({ highlight = false, id = "map" }: WorldMapProps) {
  const scaleId = `${id}-scale`;
  return (
    <div className="flex h-44 items-center justify-center rounded-xl bg-navy-wash">
      <svg viewBox="0 0 400 180" className="h-40 w-full max-w-md" aria-hidden="true">
        <rect width="400" height="180" fill="#f3f8fd" />
        <path
          d="M40 70c20-18 48-22 70-10 18 10 22 8 40 2 16-6 34-4 48 8 10 8 28 6 36-4 14-16 40-10 54 6 12 14 32 16 48 8 18-8 40-2 48 16v18c-16 8-34 4-46-6-16-14-38-10-50 4-14 16-40 14-56 2-12-10-30-8-40 2-16 16-42 12-58-2-14-12-34-10-50 2-12 8-28 6-38-4z"
          fill="#5ba4e5"
        />
        <path
          d="M48 118c12-6 28-4 36 6 10 12 28 10 38 0 8-8 22-6 28 4 10 16 32 12 42-2"
          fill="#6b86c4"
        />
        {highlight ? <circle cx="168" cy="62" r="10" fill="#2e1a7a" /> : null}
        <rect x="290" y="28" width="8" height="72" fill={`url(#${scaleId})`} />
        <defs>
          <linearGradient id={scaleId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5ba4e5" />
            <stop offset="1" stopColor="#2e1a7a" />
          </linearGradient>
        </defs>
        <text x="302" y="36" fontSize="8" fill="#6b86c4">
          200
        </text>
        <text x="302" y="100" fontSize="8" fill="#6b86c4">
          10
        </text>
      </svg>
    </div>
  );
}
