/** User profile, username availability, settings — unit tests. */
import { describe, it, expect } from 'vitest';
import { updateProfileSchema, updateSettingsSchema, checkUsernameParamsSchema } from './users.validators.js';

describe('users module validation', () => {
  describe('updateProfileSchema', () => {
    it('accepts valid profile updates', () => {
      const data = {
        name: 'Jane Doe',
        username: 'jane_doe_22',
        timezone: 'Europe/London',
        avatarUrl: 'https://example.com/avatar.png',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects an empty name', () => {
      const data = { name: '' };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid avatar URL', () => {
      const data = { avatarUrl: 'invalid-url' };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateSettingsSchema', () => {
    it('accepts valid settings', () => {
      const data = {
        theme: 'dark',
        friendVisibilityLevel: 3,
        leaderboardOptIn: false,
        weekStartDay: 1,
      };
      const result = updateSettingsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects out-of-range friend visibility level', () => {
      const data = { friendVisibilityLevel: 5 };
      const result = updateSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('checkUsernameParamsSchema', () => {
    it('accepts valid username query', () => {
      const result = checkUsernameParamsSchema.safeParse({ username: 'valid_user12' });
      expect(result.success).toBe(true);
    });

    it('rejects too short username', () => {
      const result = checkUsernameParamsSchema.safeParse({ username: 'no' });
      expect(result.success).toBe(false);
    });
  });
});
