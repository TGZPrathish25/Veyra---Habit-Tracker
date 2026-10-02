/** Session bootstrap, first-login user creation, token verification — unit tests. */
import { describe, it, expect } from 'vitest';
import { syncUserSchema } from './auth.validators.js';

describe('auth module validation', () => {
  it('validates a valid sync payload', () => {
    const valid = {
      email: 'user@example.com',
      name: 'Test User',
      username: 'test_user1',
      timezone: 'America/New_York',
    };
    const result = syncUserSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const invalid = {
      email: 'not-an-email',
      name: 'Test User',
    };
    const result = syncUserSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects a username with special characters', () => {
    const invalid = {
      email: 'user@example.com',
      username: 'user@bad#name',
    };
    const result = syncUserSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects a username that is too short', () => {
    const invalid = {
      email: 'user@example.com',
      username: 'ab',
    };
    const result = syncUserSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
