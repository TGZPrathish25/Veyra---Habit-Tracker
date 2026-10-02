/** Formatting utilities. */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat(undefined, { style: 'percent' }).format(n);
}
