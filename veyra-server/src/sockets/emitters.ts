/** Typed emit helpers used by services to push real-time events. */
import { getIO } from './index.js';
import { getUserRoom, getChallengeRoom } from './rooms.js';
import { SOCKET_EVENTS } from './events.js';

export function emitXpGained(userId: string, payload: { amount: number; total: number; level: number }): void {
  getIO().to(getUserRoom(userId)).emit(SOCKET_EVENTS.XP_GAINED, payload);
}

export function emitAchievementUnlocked(userId: string, payload: { achievement: unknown }): void {
  getIO().to(getUserRoom(userId)).emit(SOCKET_EVENTS.ACHIEVEMENT_UNLOCKED, payload);
}

export function emitStreakUpdated(userId: string, payload: { type: string; count: number }): void {
  getIO().to(getUserRoom(userId)).emit(SOCKET_EVENTS.STREAK_UPDATED, payload);
}

export function emitChallengeProgress(challengeId: string, payload: { challengeId: string; participants: unknown[] }): void {
  getIO().to(getChallengeRoom(challengeId)).emit(SOCKET_EVENTS.CHALLENGE_PROGRESS, payload);
}

export function emitNotification(userId: string, payload: { notification: unknown }): void {
  getIO().to(getUserRoom(userId)).emit(SOCKET_EVENTS.NOTIFICATION_NEW, payload);
}
