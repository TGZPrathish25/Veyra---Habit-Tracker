/** Challenges service — business logic, participant management, and completion rewards. */
import { challengesRepository } from './challenges.repository.js';
import { gamificationService } from '../gamification/gamification.service.js';
import type {
  ChallengeDTO,
  ChallengeParticipantDTO,
  CreateChallengeInput,
  UpdateChallengeProgressInput,
} from './challenges.types.js';

export class ChallengesService {
  async listChallenges(userId?: string, filter?: 'all' | 'active' | 'my'): Promise<ChallengeDTO[]> {
    const all = await challengesRepository.listChallenges(userId);
    const today = new Date().toISOString().split('T')[0];

    if (filter === 'active') {
      return all.filter((c) => c.startDate <= today && c.endDate >= today);
    }
    if (filter === 'my') {
      return all.filter((c) => c.isJoined);
    }
    return all;
  }

  async getChallenge(
    challengeId: string,
    userId?: string
  ): Promise<{ challenge: ChallengeDTO; participants: ChallengeParticipantDTO[] }> {
    const challenge = await challengesRepository.getChallengeById(challengeId, userId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    const participants = await challengesRepository.getParticipants(challengeId);
    return { challenge, participants };
  }

  async createChallenge(
    creatorId: string,
    creatorName: string,
    input: CreateChallengeInput
  ): Promise<ChallengeDTO> {
    if (input.startDate > input.endDate) {
      throw new Error('Challenge start date cannot be after end date');
    }

    return challengesRepository.createChallenge(creatorId, creatorName, input);
  }

  async joinChallenge(
    challengeId: string,
    userId: string,
    userName: string
  ): Promise<ChallengeParticipantDTO> {
    const challenge = await challengesRepository.getChallengeById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    return challengesRepository.joinChallenge(challengeId, userId, userName);
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<{ success: boolean }> {
    const success = await challengesRepository.leaveChallenge(challengeId, userId);
    return { success };
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    input: UpdateChallengeProgressInput
  ): Promise<{ participant: ChallengeParticipantDTO; xpAwarded: number }> {
    const challenge = await challengesRepository.getChallengeById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const existing = await challengesRepository.getParticipant(challengeId, userId);
    if (!existing) {
      throw new Error('You have not joined this challenge');
    }

    const prevProgress = existing.progress;
    let nextProgress = prevProgress;

    if (input.increment !== undefined) {
      nextProgress = Math.max(0, prevProgress + input.increment);
    } else if (input.progress !== undefined) {
      nextProgress = input.progress;
    }

    const updated = await challengesRepository.updateProgress(challengeId, userId, nextProgress);
    if (!updated) {
      throw new Error('Failed to update progress');
    }

    let xpAwarded = 0;
    // Check if newly completed
    if (prevProgress < challenge.targetValue && nextProgress >= challenge.targetValue) {
      xpAwarded = challenge.rewardXp;
      try {
        await gamificationService.addXp(userId, xpAwarded);
      } catch (err) {
        console.error('Failed to award challenge completion XP:', err);
      }
    }

    return { participant: updated, xpAwarded };
  }
}

export const challengesService = new ChallengesService();
