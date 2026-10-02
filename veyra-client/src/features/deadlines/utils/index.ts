/** Deadline utility functions. */
export function getDeadlineLevel(daysRemaining: number): number {
  if (daysRemaining <= 0) return 4;
  if (daysRemaining <= 1) return 3;
  if (daysRemaining <= 3) return 2;
  if (daysRemaining <= 7) return 1;
  return 0;
}
