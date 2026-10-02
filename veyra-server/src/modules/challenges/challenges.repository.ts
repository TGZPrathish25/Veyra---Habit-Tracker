/** Challenges persistence layer with Prisma and in-memory development fallback. */
import { prisma, tryPrisma } from '../../db/prisma.js';
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

const memChallenges: MemChallenge[] = [
  {
    id: 'chal-1',
    creatorId: 'demo-user-1',
    creatorName: 'Alex Rivera',
    title: '30-Day Morning Consistency',
    description: 'Build iron discipline by checking off your morning habits every day for 30 consecutive days.',
    type: 'daily_streak',
    targetValue: 30,
    rewardXp: 350,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    isPublic: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'chal-2',
    creatorId: 'demo-user-2',
    creatorName: 'Maya Chen',
    title: 'Centurion: 100 Habits Sprint',
    description: 'Complete 100 total habit check-ins before the end of the sprint cycle. All habits count!',
    type: 'task_count',
    targetValue: 100,
    rewardXp: 500,
    startDate: '2026-10-01',
    endDate: '2026-10-25',
    isPublic: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'chal-3',
    creatorId: 'demo-user-id',
    creatorName: 'You',
    title: '7-Day Flawless Momentum',
    description: 'Maintain a 100% completion rate for seven straight days.',
    type: 'daily_streak',
    targetValue: 7,
    rewardXp: 200,
    startDate: '2026-10-01',
    endDate: '2026-10-08',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const memParticipants: MemParticipant[] = [
  // chal-1 participants
  { id: 'cp-1', challengeId: 'chal-1', userId: 'demo-user-1', userName: 'Alex Rivera', userAvatar: null, userLevel: 4, progress: 14, joinedAt: '2026-10-01T08:00:00Z' },
  { id: 'cp-2', challengeId: 'chal-1', userId: 'demo-user-2', userName: 'Maya Chen', userAvatar: null, userLevel: 6, progress: 21, joinedAt: '2026-10-01T09:30:00Z' },
  { id: 'cp-3', challengeId: 'chal-1', userId: 'demo-user-id', userName: 'You', userAvatar: null, userLevel: 3, progress: 7, joinedAt: '2026-10-01T10:00:00Z' },
  // chal-2 participants
  { id: 'cp-4', challengeId: 'chal-2', userId: 'demo-user-2', userName: 'Maya Chen', userAvatar: null, userLevel: 6, progress: 48, joinedAt: '2026-10-01T09:30:00Z' },
  { id: 'cp-5', challengeId: 'chal-2', userId: 'demo-user-1', userName: 'Alex Rivera', userAvatar: null, userLevel: 4, progress: 32, joinedAt: '2026-10-01T10:00:00Z' },
  // chal-3 participants
  { id: 'cp-6', challengeId: 'chal-3', userId: 'demo-user-id', userName: 'You', userAvatar: null, userLevel: 3, progress: 5, joinedAt: '2026-10-01T11:00:00Z' },
  { id: 'cp-7', challengeId: 'chal-3', userId: 'demo-user-1', userName: 'Alex Rivera', userAvatar: null, userLevel: 4, progress: 4, joinedAt: '2026-10-01T11:30:00Z' },
];

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
      () => {
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
          id: `chal-${Date.now()}`,
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

        // Creator automatically joins
        memParticipants.push({
          id: `cp-${Date.now()}`,
          challengeId: newChallenge.id,
          userId: creatorId,
          userName: creatorName,
          userAvatar: null,
          userLevel: 3,
          progress: 0,
          joinedAt: new Date().toISOString(),
        });

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
          id: `cp-${Date.now()}`,
          challengeId,
          userId,
          userName,
          userAvatar: null,
          userLevel: 3,
          progress: 0,
          joinedAt: new Date().toISOString(),
        };
        memParticipants.push(newParticipant);

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
