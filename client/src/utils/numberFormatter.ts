export function formatNumberWithDots(value: number | string): string {
  if (value === null || value === undefined) return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";

  return num.toLocaleString("de-DE");
}
