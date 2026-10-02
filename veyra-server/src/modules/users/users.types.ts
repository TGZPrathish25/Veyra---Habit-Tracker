/** Module type definitions for users. */
import type { UserProfileDTO, UserSettingsDTO } from '../auth/auth.types.js';

export type UserDTO = UserProfileDTO;
export type SettingsDTO = UserSettingsDTO;

export interface UsernameAvailabilityDTO {
  username: string;
  available: boolean;
}
