/** User profile, username availability, settings — business logic. */
import { usersRepository } from './users.repository.js';
import type { Prisma } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import type { UpdateProfileInput, UpdateSettingsInput } from './users.validators.js';
import type { UserDTO, SettingsDTO, UsernameAvailabilityDTO } from './users.types.js';

export class UsersService {
  async getMe(userId: string): Promise<{ user: UserDTO; settings: SettingsDTO | null }> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone,
        xp: user.xp,
        level: user.level,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      settings: user.settings
        ? {
            theme: user.settings.theme,
            friendVisibilityLevel: user.settings.friendVisibilityLevel,
            leaderboardOptIn: user.settings.leaderboardOptIn,
            deadlineAlertPrefs: user.settings.deadlineAlertPrefs,
            notificationPrefs: user.settings.notificationPrefs,
            challengePrefs: user.settings.challengePrefs,
            weekStartDay: user.settings.weekStartDay,
          }
        : null,
    };
  }

  async updateMe(userId: string, input: UpdateProfileInput): Promise<UserDTO> {
    const existing = await usersRepository.findById(userId);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    if (input.username && input.username !== existing.username) {
      const taken = await usersRepository.findByUsername(input.username);
      if (taken && taken.id !== userId) {
        throw new ConflictError('Username is already taken');
      }
    }

    const updated = await usersRepository.updateUser(userId, {
      name: input.name !== undefined ? input.name : (existing.name ?? undefined),
      username: input.username !== undefined ? input.username : (existing.username ?? undefined),
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl,
      timezone: input.timezone ?? existing.timezone,
    });

    return {
      id: updated.id,
      firebaseUid: updated.firebaseUid,
      email: updated.email,
      name: updated.name,
      username: updated.username,
      avatarUrl: updated.avatarUrl,
      timezone: updated.timezone,
      xp: updated.xp,
      level: updated.level,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async getSettings(userId: string): Promise<SettingsDTO> {
    const settings = await usersRepository.getSettings(userId);
    if (!settings) {
      // Create defaults
      const created = await usersRepository.updateSettings(userId, {
        theme: 'dark',
        friendVisibilityLevel: 2,
        leaderboardOptIn: true,
        weekStartDay: 1,
      });
      return {
        theme: created.theme,
        friendVisibilityLevel: created.friendVisibilityLevel,
        leaderboardOptIn: created.leaderboardOptIn,
        deadlineAlertPrefs: created.deadlineAlertPrefs,
        notificationPrefs: created.notificationPrefs,
        challengePrefs: created.challengePrefs,
        weekStartDay: created.weekStartDay,
      };
    }

    return {
      theme: settings.theme,
      friendVisibilityLevel: settings.friendVisibilityLevel,
      leaderboardOptIn: settings.leaderboardOptIn,
      deadlineAlertPrefs: settings.deadlineAlertPrefs,
      notificationPrefs: settings.notificationPrefs,
      challengePrefs: settings.challengePrefs,
      weekStartDay: settings.weekStartDay,
    };
  }

  async updateSettings(userId: string, input: UpdateSettingsInput): Promise<SettingsDTO> {
    const updated = await usersRepository.updateSettings(userId, {
      theme: input.theme,
      friendVisibilityLevel: input.friendVisibilityLevel,
      leaderboardOptIn: input.leaderboardOptIn,
      deadlineAlertPrefs: input.deadlineAlertPrefs as unknown as Prisma.InputJsonValue,
      notificationPrefs: input.notificationPrefs as unknown as Prisma.InputJsonValue,
      challengePrefs: input.challengePrefs as unknown as Prisma.InputJsonValue,
      weekStartDay: input.weekStartDay,
    });

    return {
      theme: updated.theme,
      friendVisibilityLevel: updated.friendVisibilityLevel,
      leaderboardOptIn: updated.leaderboardOptIn,
      deadlineAlertPrefs: updated.deadlineAlertPrefs,
      notificationPrefs: updated.notificationPrefs,
      challengePrefs: updated.challengePrefs,
      weekStartDay: updated.weekStartDay,
    };
  }

  async isUsernameAvailable(username: string, currentUserId?: string): Promise<UsernameAvailabilityDTO> {
    const existing = await usersRepository.findByUsername(username);
    const available = !existing || existing.id === currentUserId;
    return {
      username,
      available,
    };
  }
}

export const usersService = new UsersService();
