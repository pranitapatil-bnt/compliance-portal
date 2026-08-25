export const datePresets = [
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
  { value: "ThisWeek", label: "This Week" },
  { value: "ThisMonth", label: "This Month" },
  { value: "ThisYear", label: "This Year" },
  { value: "Custom", label: "Custom" },
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function datesForPreset(preset: string): { from: string; to: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === "Yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const value = formatDate(yesterday);
    return { from: value, to: value };
  }
  if (preset === "ThisWeek") {
    const start = new Date(today);
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    return { from: formatDate(start), to: formatDate(today) };
  }
  if (preset === "ThisMonth") {
    return {
      from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: formatDate(today),
    };
  }
  if (preset === "ThisYear") {
    return {
      from: formatDate(new Date(today.getFullYear(), 0, 1)),
      to: formatDate(today),
    };
  }
  if (preset === "Today") {
    const value = formatDate(today);
    return { from: value, to: value };
  }
  return { from: "", to: "" };
}
