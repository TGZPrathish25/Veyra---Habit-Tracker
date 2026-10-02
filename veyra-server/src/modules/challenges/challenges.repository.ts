import { prisma, tryPrisma } from '../../db/prisma.js';
import { persistentStore } from '../../db/persistentStore.js';
import type {
  ChallengeDTO,
  ChallengeParticipantDTO,
  CreateChallengeInput,
  ChallengeType,
} from './challenges.types.js';

interface MemChallenge {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  targetValue: number;
  rewardXp: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
}

interface MemParticipant {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userLevel: number;
  progress: number;
  joinedAt: string;
}

const memChallenges: MemChallenge[] = [];
const memParticipants: MemParticipant[] = [];

export class ChallengesRepository {
  async listChallenges(userId?: string): Promise<ChallengeDTO[]> {
    return tryPrisma(
      async () => {
        const rows = await prisma.challenge.findMany({
          include: {
            creator: true,
            participants: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        return rows.map((r) => {
          const userParticipant = userId ? r.participants.find((p) => p.userId === userId) : null;
          return {
            id: r.id,
            creatorId: r.creatorId,
            creatorName: r.creator.name || r.creator.username || 'Creator',
            title: r.title,
            description: r.description,
            type: r.type as ChallengeType,
            targetValue: r.targetValue,
            rewardXp: 150,
            startDate: r.startDate.toISOString().split('T')[0],
            endDate: r.endDate.toISOString().split('T')[0],
            isPublic: r.isPublic,
            createdAt: r.createdAt.toISOString(),
            participantCount: r.participants.length,
            isJoined: !!userParticipant,
            userProgress: userParticipant?.progress ?? 0,
            isCompleted: (userParticipant?.progress ?? 0) >= r.targetValue,
          };
        });
      },
      async () => {
        const storedChals = (await persistentStore.getChallenges()) as MemChallenge[];
        for (const sc of storedChals) {
          if (!memChallenges.some((c) => c.id === sc.id)) {
            memChallenges.push(sc);
          }
        }
        const storedParts = (await persistentStore.getParticipants()) as MemParticipant[];
        for (const sp of storedParts) {
          if (!memParticipants.some((p) => p.id === sp.id)) {
            memParticipants.push(sp);
          }
        }

        return memChallenges.map((c) => {
          const parts = memParticipants.filter((p) => p.challengeId === c.id);
          const userPart = userId ? parts.find((p) => p.userId === userId) : null;
          return {
            ...c,
            participantCount: parts.length,
            isJoined: !!userPart,
            userProgress: userPart?.progress ?? 0,
            isCompleted: (userPart?.progress ?? 0) >= c.targetValue,
          };
        });
      }
    );
  }

  async getChallengeById(challengeId: string, userId?: string): Promise<ChallengeDTO | null> {
    return tryPrisma(
      async () => {
        const r = await prisma.challenge.findUnique({
          where: { id: challengeId },
          include: {
            creator: true,
            participants: true,
          },
        });
        if (!r) return null;
        const userParticipant = userId ? r.participants.find((p) => p.userId === userId) : null;
        return {
          id: r.id,
          creatorId: r.creatorId,
          creatorName: r.creator.name || r.creator.username || 'Creator',
          title: r.title,
          description: r.description,
          type: r.type as ChallengeType,
          targetValue: r.targetValue,
          rewardXp: 150,
          startDate: r.startDate.toISOString().split('T')[0],
          endDate: r.endDate.toISOString().split('T')[0],
          isPublic: r.isPublic,
          createdAt: r.createdAt.toISOString(),
          participantCount: r.participants.length,
          isJoined: !!userParticipant,
          userProgress: userParticipant?.progress ?? 0,
          isCompleted: (userParticipant?.progress ?? 0) >= r.targetValue,
        };
      },
      () => {
        const c = memChallenges.find((item) => item.id === challengeId);
        if (!c) return null;
        const parts = memParticipants.filter((p) => p.challengeId === c.id);
        const userPart = userId ? parts.find((p) => p.userId === userId) : null;
        return {
          ...c,
          participantCount: parts.length,
          isJoined: !!userPart,
          userProgress: userPart?.progress ?? 0,
          isCompleted: (userPart?.progress ?? 0) >= c.targetValue,
        };
      }
    );
  }

  async createChallenge(creatorId: string, creatorName: string, data: CreateChallengeInput): Promise<ChallengeDTO> {
    return tryPrisma(
      async () => {
        const c = await prisma.challenge.create({
          data: {
            creatorId,
            title: data.title,
            description: data.description || null,
            type: data.type,
            targetValue: data.targetValue,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            isPublic: data.isPublic ?? true,
          },
          include: {
            creator: true,
            participants: true,
          },
        });

        // Automatically join the creator
        await prisma.challengeParticipant.create({
          data: {
            challengeId: c.id,
            userId: creatorId,
            progress: 0,
          },
        });

        return {
          id: c.id,
          creatorId: c.creatorId,
          creatorName: c.creator.name || c.creator.username || creatorName,
          title: c.title,
          description: c.description,
          type: c.type as ChallengeType,
          targetValue: c.targetValue,
          rewardXp: data.rewardXp ?? 150,
          startDate: data.startDate,
          endDate: data.endDate,
          isPublic: c.isPublic,
          createdAt: c.createdAt.toISOString(),
          participantCount: 1,
          isJoined: true,
          userProgress: 0,
          isCompleted: false,
        };
      },
      () => {
        const newChallenge: MemChallenge = {
          id: `chal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          creatorId,
          creatorName,
          title: data.title,
          description: data.description || null,
          type: data.type,
          targetValue: data.targetValue,
          rewardXp: data.rewardXp ?? 150,
          startDate: data.startDate,
          endDate: data.endDate,
          isPublic: data.isPublic ?? true,
          createdAt: new Date().toISOString(),
        };
        memChallenges.unshift(newChallenge);
        persistentStore.saveChallenge(newChallenge);

        // Creator automatically joins
        const creatorParticipant: MemParticipant = {
          id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          challengeId: newChallenge.id,
          userId: creatorId,
          userName: creatorName,
          userAvatar: null,
          userLevel: 3,
          progress: 0,
          joinedAt: new Date().toISOString(),
        };
        memParticipants.push(creatorParticipant);
        persistentStore.saveParticipant(creatorParticipant);

        return {
          ...newChallenge,
          participantCount: 1,
          isJoined: true,
          userProgress: 0,
          isCompleted: false,
        };
      }
    );
  }

  async getParticipants(challengeId: string): Promise<ChallengeParticipantDTO[]> {
    return tryPrisma(
      async () => {
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        const targetValue = challenge?.targetValue ?? 1;

        const rows = await prisma.challengeParticipant.findMany({
          where: { challengeId },
          include: {
            user: { include: { gamification: true } },
          },
          orderBy: { progress: 'desc' },
        });

        return rows.map((p) => {
          const progressPct = Math.min(100, Math.round((p.progress / targetValue) * 100));
          return {
            id: p.id,
            challengeId: p.challengeId,
            userId: p.userId,
            userName: p.user.name || p.user.username || 'Participant',
            userAvatar: p.user.avatarUrl,
            userLevel: p.user.gamification?.level ?? 1,
            progress: p.progress,
            targetValue,
            progressPercentage: progressPct,
            completed: p.progress >= targetValue,
            joinedAt: p.joinedAt.toISOString(),
          };
        });
      },
      () => {
        const challenge = memChallenges.find((c) => c.id === challengeId);
        const targetValue = challenge?.targetValue ?? 1;
        const rows = memParticipants.filter((p) => p.challengeId === challengeId);

        return rows
          .map((p) => {
            const progressPct = Math.min(100, Math.round((p.progress / targetValue) * 100));
            return {
              id: p.id,
              challengeId: p.challengeId,
              userId: p.userId,
              userName: p.userName,
              userAvatar: p.userAvatar,
              userLevel: p.userLevel,
              progress: p.progress,
              targetValue,
              progressPercentage: progressPct,
              completed: p.progress >= targetValue,
              joinedAt: p.joinedAt,
            };
          })
          .sort((a, b) => b.progress - a.progress);
      }
    );
  }

  async getParticipant(challengeId: string, userId: string): Promise<ChallengeParticipantDTO | null> {
    const list = await this.getParticipants(challengeId);
    return list.find((p) => p.userId === userId) || null;
  }

  async joinChallenge(
    challengeId: string,
    userId: string,
    userName: string
  ): Promise<ChallengeParticipantDTO> {
    return tryPrisma(
      async () => {
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        const targetValue = challenge?.targetValue ?? 1;

        const p = await prisma.challengeParticipant.create({
          data: {
            challengeId,
            userId,
            progress: 0,
          },
          include: {
            user: { include: { gamification: true } },
          },
        });

        return {
          id: p.id,
          challengeId: p.challengeId,
          userId: p.userId,
          userName: p.user.name || p.user.username || userName,
          userAvatar: p.user.avatarUrl,
          userLevel: p.user.gamification?.level ?? 1,
          progress: 0,
          targetValue,
          progressPercentage: 0,
          completed: false,
          joinedAt: p.joinedAt.toISOString(),
        };
      },
      () => {
        const challenge = memChallenges.find((c) => c.id === challengeId);
        const targetValue = challenge?.targetValue ?? 1;

        const existing = memParticipants.find((p) => p.challengeId === challengeId && p.userId === userId);
        if (existing) {
          return {
            id: existing.id,
            challengeId,
            userId,
            userName: existing.userName,
            userAvatar: existing.userAvatar,
            userLevel: existing.userLevel,
            progress: existing.progress,
            targetValue,
            progressPercentage: Math.min(100, Math.round((existing.progress / targetValue) * 100)),
            completed: existing.progress >= targetValue,
            joinedAt: existing.joinedAt,
          };
        }

        const newParticipant: MemParticipant = {
          id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          challengeId,
          userId,
          userName,
          userAvatar: null,
          userLevel: 3,
          progress: 0,
          joinedAt: new Date().toISOString(),
        };
        memParticipants.push(newParticipant);
        persistentStore.saveParticipant(newParticipant);

        return {
          id: newParticipant.id,
          challengeId,
          userId,
          userName,
          userAvatar: null,
          userLevel: 3,
          progress: 0,
          targetValue,
          progressPercentage: 0,
          completed: false,
          joinedAt: newParticipant.joinedAt,
        };
      }
    );
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<boolean> {
    return tryPrisma(
      async () => {
        await prisma.challengeParticipant.deleteMany({
          where: { challengeId, userId },
        });
        return true;
      },
      () => {
        const idx = memParticipants.findIndex((p) => p.challengeId === challengeId && p.userId === userId);
        if (idx >= 0) {
          memParticipants.splice(idx, 1);
          return true;
        }
        return false;
      }
    );
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    newProgress: number
  ): Promise<ChallengeParticipantDTO | null> {
    return tryPrisma(
      async () => {
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge) return null;

        const p = await prisma.challengeParticipant.update({
          where: { challengeId_userId: { challengeId, userId } },
          data: { progress: newProgress },
          include: { user: { include: { gamification: true } } },
        });

        const targetValue = challenge.targetValue;
        return {
          id: p.id,
          challengeId: p.challengeId,
          userId: p.userId,
          userName: p.user.name || p.user.username || 'Participant',
          userAvatar: p.user.avatarUrl,
          userLevel: p.user.gamification?.level ?? 1,
          progress: p.progress,
          targetValue,
          progressPercentage: Math.min(100, Math.round((p.progress / targetValue) * 100)),
          completed: p.progress >= targetValue,
          joinedAt: p.joinedAt.toISOString(),
        };
      },
      () => {
        const challenge = memChallenges.find((c) => c.id === challengeId);
        if (!challenge) return null;

        const p = memParticipants.find((item) => item.challengeId === challengeId && item.userId === userId);
        if (!p) return null;

        p.progress = newProgress;
        persistentStore.updateParticipantProgress(p.id, newProgress);
        const targetValue = challenge.targetValue;
        return {
          id: p.id,
          challengeId: p.challengeId,
          userId: p.userId,
          userName: p.userName,
          userAvatar: p.userAvatar,
          userLevel: p.userLevel,
          progress: p.progress,
          targetValue,
          progressPercentage: Math.min(100, Math.round((p.progress / targetValue) * 100)),
          completed: p.progress >= targetValue,
          joinedAt: p.joinedAt,
        };
      }
    );
  }
}

export const challengesRepository = new ChallengesRepository();
