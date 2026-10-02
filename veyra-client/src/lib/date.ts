/** Timezone-aware date helpers. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
