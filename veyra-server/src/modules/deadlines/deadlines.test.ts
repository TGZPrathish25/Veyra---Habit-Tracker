/** Deadline monitoring unit tests. */
import { describe, it, expect } from 'vitest';
import { calculateUrgency, deadlinesService } from './deadlines.service.js';

describe('Deadlines Module', () => {
  it('correctly categorizes urgency based on minutes remaining', () => {
    const base = new Date('2026-10-02T12:00:00Z');

    // Overdue
    const past = new Date('2026-10-02T11:59:00Z');
    expect(calculateUrgency(base, past).urgency).toBe('overdue');

    // Urgent (<= 30 min)
    const urgent = new Date('2026-10-02T12:20:00Z');
    expect(calculateUrgency(base, urgent).urgency).toBe('urgent');

    // Approaching (<= 180 min)
    const approaching = new Date('2026-10-02T14:00:00Z');
    expect(calculateUrgency(base, approaching).urgency).toBe('approaching');

    // Normal (> 180 min)
    const normal = new Date('2026-10-02T20:00:00Z');
    expect(calculateUrgency(base, normal).urgency).toBe('normal');
  });

  it('evaluates deadline status for a user', async () => {
    const res = await deadlinesService.getStatusForUser('usr_test_deadlines');
    expect(res).toBeDefined();
    expect(res.counts).toBeDefined();
    expect(Array.isArray(res.deadlines)).toBe(true);
  });
});
