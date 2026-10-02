/** Factory functions for creating test data. */

export function createTaskData(overrides = {}) {
  return {
    title: 'Test Task',
    emoji: '📝',
    color: '#8b5cf6',
    daysOfWeek: [1, 2, 3, 4, 5],
    ...overrides,
  };
}
