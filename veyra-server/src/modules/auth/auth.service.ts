/** Session bootstrap, first-login user creation, token verification — business logic. */
import { usersRepository, type UserRecord, type SettingsRecord } from '../users/users.repository.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import type { SyncUserInput } from './auth.validators.js';
import type { AuthResponseDTO, UserProfileDTO, UserSettingsDTO } from './auth.types.js';
import { DEFAULT_TIMEZONE } from '../../lib/time.js';

export class AuthService {
  async syncUser(firebaseUid: string, input: SyncUserInput): Promise<AuthResponseDTO> {
    let user = await usersRepository.findByFirebaseUid(firebaseUid);

    if (user) {
      if (input.username && input.username.toLowerCase() !== user.username?.toLowerCase()) {
        const existing = await usersRepository.findByUsername(input.username);
        if (existing && existing.id !== user.id) {
          throw new ConflictError('Username is already taken');
        }
      }

      user = await usersRepository.updateUser(user.id, {
        name: input.name ?? user.name ?? undefined,
        username: input.username ?? user.username ?? undefined,
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : user.avatarUrl,
        timezone: input.timezone ?? user.timezone,
      });
    } else {
      let desiredUsername = input.username;
      if (!desiredUsername) {
        const base = input.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        desiredUsername = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const existingUser = await usersRepository.findByUsername(desiredUsername);
      if (existingUser) {
        desiredUsername = `${desiredUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      user = await usersRepository.createUser({
        firebaseUid,
        email: input.email,
        name: input.name || input.email.split('@')[0],
        username: desiredUsername,
        avatarUrl: input.avatarUrl || null,
        timezone: input.timezone || DEFAULT_TIMEZONE,
      });
    }

    const settings = await usersRepository.getSettings(user.id);
    return this.formatAuthResponse(user, settings);
  }

  async getCurrentUser(userId: string): Promise<AuthResponseDTO> {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const settings = await usersRepository.getSettings(userId);
    return this.formatAuthResponse(user, settings);
  }

  private formatAuthResponse(user: UserRecord, settings: SettingsRecord | null): AuthResponseDTO {
    const userDto: UserProfileDTO = {
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
    };

    const settingsDto: UserSettingsDTO | null = settings
      ? {
          theme: settings.theme,
          friendVisibilityLevel: settings.friendVisibilityLevel,
          leaderboardOptIn: settings.leaderboardOptIn,
          deadlineAlertPrefs: settings.deadlineAlertPrefs,
          notificationPrefs: settings.notificationPrefs,
          challengePrefs: settings.challengePrefs,
          weekStartDay: settings.weekStartDay,
        }
      : null;

    return {
      user: userDto,
      settings: settingsDto,
    };
  }
}

export const authService = new AuthService();
