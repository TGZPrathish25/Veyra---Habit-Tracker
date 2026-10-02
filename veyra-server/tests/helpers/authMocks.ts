/** Auth mock helpers for testing. */

export function createMockUser() {
  return {
    uid: 'test-firebase-uid',
    email: 'test@veyra.app',
    id: 'test-user-id',
  };
}

export function createMockToken(): string {
  return 'mock-firebase-token';
}
