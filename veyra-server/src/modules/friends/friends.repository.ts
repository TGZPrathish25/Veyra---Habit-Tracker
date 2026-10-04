/** Friends & requests persistence with Prisma and in-memory development fallback. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import { persistentStore } from '../../db/persistentStore.js';
import type {
  FriendshipDTO,
  FriendRequestDTO,
  FriendUserDTO,
  PrivacyLevel,
  FriendActivityFeedDTO,
} from './friends.types.js';

interface MemFriendship {
  id: string;
  userId: string;
  friendId: string;
  privacyLevel: PrivacyLevel;
  createdAt: string;
}

interface MemFriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const DEFAULT_COMMUNITY_USERS: FriendUserDTO[] = [
  {
    id: 'usr_mayachen',
    name: 'Maya Chen',
    username: 'mayachen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    level: 7,
    totalXp: 2840,
    currentStreak: 19,
  },
  {
    id: 'usr_samtaylor',
    name: 'Sam Taylor',
    username: 'sam_t',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    level: 5,
    totalXp: 1650,
    currentStreak: 12,
  },
  {
    id: 'usr_alexrivera',
    name: 'Alex Rivera',
    username: 'alex_r',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    level: 9,
    totalXp: 4120,
    currentStreak: 31,
  },
  {
    id: 'usr_jordanlee',
    name: 'Jordan Lee',
    username: 'jordan_lee',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    level: 4,
    totalXp: 980,
    currentStreak: 7,
  },
  {
    id: 'usr_sarahkim',
    name: 'Sarah Kim',
    username: 'sarah_k',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    level: 6,
    totalXp: 2190,
    currentStreak: 15,
  },
];

// In-memory friends catalog
const demoUsersMap = new Map<string, FriendUserDTO>();
const memFriendships: MemFriendship[] = [];
const memRequests: MemFriendRequest[] = [];

export class FriendsRepository {
  private async ensureCommunityUser(u: FriendUserDTO): Promise<void> {
    await tryPrisma(
      async () => {
        await prisma.user.upsert({
          where: { id: u.id },
          update: {},
          create: {
            id: u.id,
            firebaseUid: `uid_${u.username}`,
            email: `${u.username}@veyra.app`,
            name: u.name,
            username: u.username?.toLowerCase() || u.id,
            avatarUrl: u.avatarUrl,
            gamification: {
              create: {
                level: u.level,
                totalXp: u.totalXp,
              },
            },
            streaks: {
              create: {
                type: 'daily',
                current: u.currentStreak,
                longest: u.currentStreak,
              },
            },
          },
        });
      },
      () => {
        demoUsersMap.set(u.id, u);
      }
    );
  }

  async findUserById(userId: string): Promise<FriendUserDTO | null> {
    const communityFallback = DEFAULT_COMMUNITY_USERS.find((cu) => cu.id === userId);
    if (communityFallback) {
      await this.ensureCommunityUser(communityFallback).catch(() => {});
    }

    return tryPrisma(
      async () => {
        const u = await prisma.user.findUnique({
          where: { id: userId },
          include: { gamification: true, streaks: { where: { type: 'daily' } } },
        });
        if (!u) return communityFallback || null;
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl,
          level: u.gamification?.level ?? 1,
          totalXp: u.gamification?.totalXp ?? 0,
          currentStreak: u.streaks[0]?.current ?? 0,
        };
      },
      () => demoUsersMap.get(userId) || communityFallback || null
    );
  }

  async findUserByUsername(username: string): Promise<FriendUserDTO | null> {
    const clean = username.toLowerCase().trim();
    const communityFallback = DEFAULT_COMMUNITY_USERS.find((cu) => cu.username?.toLowerCase() === clean);
    if (communityFallback) {
      await this.ensureCommunityUser(communityFallback).catch(() => {});
    }

    return tryPrisma(
      async () => {
        const u = await prisma.user.findFirst({
          where: { username: { equals: clean, mode: 'insensitive' } },
          include: { gamification: true, streaks: { where: { type: 'daily' } } },
        });
        if (!u) return communityFallback || null;
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl,
          level: u.gamification?.level ?? 1,
          totalXp: u.gamification?.totalXp ?? 0,
          currentStreak: u.streaks[0]?.current ?? 0,
        };
      },
      () => {
        for (const u of demoUsersMap.values()) {
          if (u.username?.toLowerCase() === clean) return u;
        }
        return communityFallback || null;
      }
    );
  }

  async listAllUsers(excludeUserId: string): Promise<FriendUserDTO[]> {
    return tryPrisma(
      async () => {
        // Ensure community users exist in database so they can be added
        for (const cu of DEFAULT_COMMUNITY_USERS) {
          if (cu.id !== excludeUserId) {
            await this.ensureCommunityUser(cu).catch(() => {});
          }
        }

        const users = await prisma.user.findMany({
          where: { id: { not: excludeUserId } },
          include: {
            gamification: true,
            streaks: { where: { type: 'daily' } },
          },
          take: 50,
          orderBy: { createdAt: 'desc' },
        });

        const mapped: FriendUserDTO[] = users.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl,
          level: u.gamification?.level ?? 1,
          totalXp: u.gamification?.totalXp ?? 0,
          currentStreak: u.streaks[0]?.current ?? 0,
        }));

        const existingIds = new Set(mapped.map((u) => u.id));
        for (const cu of DEFAULT_COMMUNITY_USERS) {
          if (cu.id !== excludeUserId && !existingIds.has(cu.id)) {
            mapped.push(cu);
          }
        }

        return mapped;
      },
      () => {
        const result: FriendUserDTO[] = [];
        const seenIds = new Set<string>();

        // 1. PersistentStore users
        const storedUsers = persistentStore.getAllUsers();
        for (const u of storedUsers) {
          if (u.id !== excludeUserId && !seenIds.has(u.id)) {
            seenIds.add(u.id);
            result.push({
              id: u.id,
              name: u.name,
              username: u.username,
              avatarUrl: u.avatarUrl,
              level: u.level || 1,
              totalXp: u.xp || 0,
              currentStreak: 0,
            });
          }
        }

        // 2. In-memory demoUsersMap
        for (const u of demoUsersMap.values()) {
          if (u.id !== excludeUserId && !seenIds.has(u.id)) {
            seenIds.add(u.id);
            result.push(u);
          }
        }

        // 3. Default community users
        for (const cu of DEFAULT_COMMUNITY_USERS) {
          if (cu.id !== excludeUserId && !seenIds.has(cu.id)) {
            seenIds.add(cu.id);
            result.push(cu);
          }
        }

        return result;
      }
    );
  }

  async listFriends(userId: string): Promise<FriendshipDTO[]> {
    return tryPrisma(
      async () => {
        const rows = await prisma.friendship.findMany({
          where: { userId },
          include: {
            friend: {
              include: {
                gamification: true,
                streaks: { where: { type: 'daily' } },
              },
            },
          },
        });
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          friendId: r.friendId,
          privacyLevel: (r.privacyLevel as PrivacyLevel) || 'basic',
          createdAt: r.createdAt.toISOString(),
          friend: {
            id: r.friend.id,
            name: r.friend.name,
            username: r.friend.username,
            avatarUrl: r.friend.avatarUrl,
            level: r.friend.gamification?.level ?? 1,
            totalXp: r.friend.gamification?.totalXp ?? 0,
            currentStreak: r.friend.streaks[0]?.current ?? 0,
          },
        }));
      },
      () => {
        const userFriendships = memFriendships.filter((f) => f.userId === userId);
        return userFriendships.map((f) => {
          const friend = demoUsersMap.get(f.friendId) || {
            id: f.friendId,
            name: 'Friend',
            username: 'friend',
            avatarUrl: null,
            level: 1,
            totalXp: 0,
            currentStreak: 0,
          };
          return {
            ...f,
            friend,
          };
        });
      }
    );
  }

  async getFriendship(userId: string, friendId: string): Promise<FriendshipDTO | null> {
    return tryPrisma(
      async () => {
        const r = await prisma.friendship.findUnique({
          where: { userId_friendId: { userId, friendId } },
          include: {
            friend: {
              include: {
                gamification: true,
                streaks: { where: { type: 'daily' } },
              },
            },
          },
        });
        if (!r) return null;
        return {
          id: r.id,
          userId: r.userId,
          friendId: r.friendId,
          privacyLevel: (r.privacyLevel as PrivacyLevel) || 'basic',
          createdAt: r.createdAt.toISOString(),
          friend: {
            id: r.friend.id,
            name: r.friend.name,
            username: r.friend.username,
            avatarUrl: r.friend.avatarUrl,
            level: r.friend.gamification?.level ?? 1,
            totalXp: r.friend.gamification?.totalXp ?? 0,
            currentStreak: r.friend.streaks[0]?.current ?? 0,
          },
        };
      },
      () => {
        const found = memFriendships.find((f) => f.userId === userId && f.friendId === friendId);
        if (!found) return null;
        const friend = demoUsersMap.get(friendId) || {
          id: friendId,
          name: 'Friend',
          username: 'friend',
          avatarUrl: null,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
        };
        return { ...found, friend };
      }
    );
  }

  async createFriendship(
    userId: string,
    friendId: string,
    privacyLevel: PrivacyLevel = 'basic'
  ): Promise<FriendshipDTO> {
    return tryPrisma(
      async () => {
        const r = await prisma.friendship.upsert({
          where: { userId_friendId: { userId, friendId } },
          create: { userId, friendId, privacyLevel },
          update: { privacyLevel },
          include: {
            friend: {
              include: {
                gamification: true,
                streaks: { where: { type: 'daily' } },
              },
            },
          },
        });
        return {
          id: r.id,
          userId: r.userId,
          friendId: r.friendId,
          privacyLevel: (r.privacyLevel as PrivacyLevel) || 'basic',
          createdAt: r.createdAt.toISOString(),
          friend: {
            id: r.friend.id,
            name: r.friend.name,
            username: r.friend.username,
            avatarUrl: r.friend.avatarUrl,
            level: r.friend.gamification?.level ?? 1,
            totalXp: r.friend.gamification?.totalXp ?? 0,
            currentStreak: r.friend.streaks[0]?.current ?? 0,
          },
        };
      },
      () => {
        const existingIdx = memFriendships.findIndex((f) => f.userId === userId && f.friendId === friendId);
        const record: MemFriendship = {
          id: existingIdx >= 0 ? memFriendships[existingIdx].id : `fship-${Date.now()}`,
          userId,
          friendId,
          privacyLevel,
          createdAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          memFriendships[existingIdx] = record;
        } else {
          memFriendships.push(record);
        }
        const friend = demoUsersMap.get(friendId) || {
          id: friendId,
          name: 'Friend',
          username: 'friend',
          avatarUrl: null,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
        };
        return { ...record, friend };
      }
    );
  }

  async updatePrivacyLevel(
    userId: string,
    friendId: string,
    privacyLevel: PrivacyLevel
  ): Promise<FriendshipDTO | null> {
    return tryPrisma(
      async () => {
        const r = await prisma.friendship.update({
          where: { userId_friendId: { userId, friendId } },
          data: { privacyLevel },
          include: {
            friend: {
              include: {
                gamification: true,
                streaks: { where: { type: 'daily' } },
              },
            },
          },
        });
        return {
          id: r.id,
          userId: r.userId,
          friendId: r.friendId,
          privacyLevel: (r.privacyLevel as PrivacyLevel) || 'basic',
          createdAt: r.createdAt.toISOString(),
          friend: {
            id: r.friend.id,
            name: r.friend.name,
            username: r.friend.username,
            avatarUrl: r.friend.avatarUrl,
            level: r.friend.gamification?.level ?? 1,
            totalXp: r.friend.gamification?.totalXp ?? 0,
            currentStreak: r.friend.streaks[0]?.current ?? 0,
          },
        };
      },
      () => {
        const found = memFriendships.find((f) => f.userId === userId && f.friendId === friendId);
        if (!found) return null;
        found.privacyLevel = privacyLevel;
        const friend = demoUsersMap.get(friendId) || {
          id: friendId,
          name: 'Friend',
          username: 'friend',
          avatarUrl: null,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
        };
        return { ...found, friend };
      }
    );
  }

  async removeFriendship(userId: string, friendId: string): Promise<boolean> {
    return tryPrisma(
      async () => {
        await prisma.friendship.deleteMany({
          where: {
            OR: [
              { userId, friendId },
              { userId: friendId, friendId: userId },
            ],
          },
        });
        return true;
      },
      () => {
        const initialLen = memFriendships.length;
        const filtered = memFriendships.filter(
          (f) => !(f.userId === userId && f.friendId === friendId) && !(f.userId === friendId && f.friendId === userId)
        );
        memFriendships.length = 0;
        memFriendships.push(...filtered);
        return memFriendships.length < initialLen;
      }
    );
  }

  async listFriendRequests(userId: string): Promise<{
    incoming: FriendRequestDTO[];
    outgoing: FriendRequestDTO[];
  }> {
    return tryPrisma(
      async () => {
        const rows = await prisma.friendRequest.findMany({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
            status: 'pending',
          },
          include: {
            sender: { include: { gamification: true, streaks: { where: { type: 'daily' } } } },
            receiver: { include: { gamification: true, streaks: { where: { type: 'daily' } } } },
          },
          orderBy: { createdAt: 'desc' },
        });

        const incoming: FriendRequestDTO[] = [];
        const outgoing: FriendRequestDTO[] = [];

        for (const r of rows) {
          const dto: FriendRequestDTO = {
            id: r.id,
            senderId: r.senderId,
            receiverId: r.receiverId,
            status: r.status as 'pending' | 'accepted' | 'rejected',
            createdAt: r.createdAt.toISOString(),
            sender: {
              id: r.sender.id,
              name: r.sender.name,
              username: r.sender.username,
              avatarUrl: r.sender.avatarUrl,
              level: r.sender.gamification?.level ?? 1,
              totalXp: r.sender.gamification?.totalXp ?? 0,
              currentStreak: r.sender.streaks[0]?.current ?? 0,
            },
            receiver: {
              id: r.receiver.id,
              name: r.receiver.name,
              username: r.receiver.username,
              avatarUrl: r.receiver.avatarUrl,
              level: r.receiver.gamification?.level ?? 1,
              totalXp: r.receiver.gamification?.totalXp ?? 0,
              currentStreak: r.receiver.streaks[0]?.current ?? 0,
            },
          };
          if (r.receiverId === userId) {
            incoming.push(dto);
          } else {
            outgoing.push(dto);
          }
        }
        return { incoming, outgoing };
      },
      () => {
        const pending = memRequests.filter(
          (r) => (r.senderId === userId || r.receiverId === userId) && r.status === 'pending'
        );
        const incoming: FriendRequestDTO[] = [];
        const outgoing: FriendRequestDTO[] = [];

        for (const r of pending) {
          const sender = demoUsersMap.get(r.senderId) || {
            id: r.senderId,
            name: 'Sender',
            username: 'sender',
            avatarUrl: null,
            level: 1,
            totalXp: 0,
            currentStreak: 0,
          };
          const receiver = demoUsersMap.get(r.receiverId) || {
            id: r.receiverId,
            name: 'Receiver',
            username: 'receiver',
            avatarUrl: null,
            level: 1,
            totalXp: 0,
            currentStreak: 0,
          };
          const dto: FriendRequestDTO = {
            ...r,
            sender,
            receiver,
          };
          if (r.receiverId === userId) incoming.push(dto);
          else outgoing.push(dto);
        }
        return { incoming, outgoing };
      }
    );
  }

  async findPendingRequest(senderId: string, receiverId: string): Promise<FriendRequestDTO | null> {
    return tryPrisma(
      async () => {
        const r = await prisma.friendRequest.findFirst({
          where: {
            OR: [
              { senderId, receiverId, status: 'pending' },
              { senderId: receiverId, receiverId: senderId, status: 'pending' },
            ],
          },
        });
        if (!r) return null;
        return {
          id: r.id,
          senderId: r.senderId,
          receiverId: r.receiverId,
          status: r.status as 'pending',
          createdAt: r.createdAt.toISOString(),
          sender: { id: r.senderId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
          receiver: { id: r.receiverId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
        };
      },
      () => {
        const req = memRequests.find(
          (r) =>
            ((r.senderId === senderId && r.receiverId === receiverId) ||
              (r.senderId === receiverId && r.receiverId === senderId)) &&
            r.status === 'pending'
        );
        if (!req) return null;
        return {
          ...req,
          sender: demoUsersMap.get(req.senderId) || { id: req.senderId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
          receiver: demoUsersMap.get(req.receiverId) || { id: req.receiverId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
        };
      }
    );
  }

  async createFriendRequest(senderId: string, receiverId: string): Promise<FriendRequestDTO> {
    return tryPrisma(
      async () => {
        const r = await prisma.friendRequest.create({
          data: { senderId, receiverId, status: 'pending' },
          include: {
            sender: { include: { gamification: true, streaks: { where: { type: 'daily' } } } },
            receiver: { include: { gamification: true, streaks: { where: { type: 'daily' } } } },
          },
        });
        return {
          id: r.id,
          senderId: r.senderId,
          receiverId: r.receiverId,
          status: 'pending',
          createdAt: r.createdAt.toISOString(),
          sender: {
            id: r.sender.id,
            name: r.sender.name,
            username: r.sender.username,
            avatarUrl: r.sender.avatarUrl,
            level: r.sender.gamification?.level ?? 1,
            totalXp: r.sender.gamification?.totalXp ?? 0,
            currentStreak: r.sender.streaks[0]?.current ?? 0,
          },
          receiver: {
            id: r.receiver.id,
            name: r.receiver.name,
            username: r.receiver.username,
            avatarUrl: r.receiver.avatarUrl,
            level: r.receiver.gamification?.level ?? 1,
            totalXp: r.receiver.gamification?.totalXp ?? 0,
            currentStreak: r.receiver.streaks[0]?.current ?? 0,
          },
        };
      },
      () => {
        const newReq: MemFriendRequest = {
          id: `freq-${Date.now()}`,
          senderId,
          receiverId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        memRequests.push(newReq);
        return {
          ...newReq,
          sender: demoUsersMap.get(senderId) || { id: senderId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
          receiver: demoUsersMap.get(receiverId) || { id: receiverId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
        };
      }
    );
  }

  async respondFriendRequest(
    requestId: string,
    action: 'accept' | 'reject',
    receiverId: string
  ): Promise<FriendRequestDTO | null> {
    const status = action === 'accept' ? 'accepted' : 'rejected';
    return tryPrisma(
      async () => {
        const req = await prisma.friendRequest.findUnique({ where: { id: requestId } });
        if (!req || req.receiverId !== receiverId) return null;

        const updated = await prisma.friendRequest.update({
          where: { id: requestId },
          data: { status },
          include: {
            sender: { include: { gamification: true, streaks: { where: { type: 'daily' } } } },
            receiver: { include: { gamification: true, streaks: { where: { type: 'daily' } } } },
          },
        });

        if (action === 'accept') {
          // Create reciprocal friendship records
          await prisma.friendship.createMany({
            data: [
              { userId: req.receiverId, friendId: req.senderId, privacyLevel: 'detailed' },
              { userId: req.senderId, friendId: req.receiverId, privacyLevel: 'detailed' },
            ],
            skipDuplicates: true,
          });
        }

        return {
          id: updated.id,
          senderId: updated.senderId,
          receiverId: updated.receiverId,
          status,
          createdAt: updated.createdAt.toISOString(),
          sender: {
            id: updated.sender.id,
            name: updated.sender.name,
            username: updated.sender.username,
            avatarUrl: updated.sender.avatarUrl,
            level: updated.sender.gamification?.level ?? 1,
            totalXp: updated.sender.gamification?.totalXp ?? 0,
            currentStreak: updated.sender.streaks[0]?.current ?? 0,
          },
          receiver: {
            id: updated.receiver.id,
            name: updated.receiver.name,
            username: updated.receiver.username,
            avatarUrl: updated.receiver.avatarUrl,
            level: updated.receiver.gamification?.level ?? 1,
            totalXp: updated.receiver.gamification?.totalXp ?? 0,
            currentStreak: updated.receiver.streaks[0]?.current ?? 0,
          },
        };
      },
      () => {
        const req = memRequests.find((r) => r.id === requestId && r.receiverId === receiverId);
        if (!req) return null;
        req.status = status;

        if (action === 'accept') {
          memFriendships.push(
            {
              id: `fship-${Date.now()}-1`,
              userId: req.receiverId,
              friendId: req.senderId,
              privacyLevel: 'detailed',
              createdAt: new Date().toISOString(),
            },
            {
              id: `fship-${Date.now()}-2`,
              userId: req.senderId,
              friendId: req.receiverId,
              privacyLevel: 'detailed',
              createdAt: new Date().toISOString(),
            }
          );
        }

        return {
          ...req,
          sender: demoUsersMap.get(req.senderId) || { id: req.senderId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
          receiver: demoUsersMap.get(req.receiverId) || { id: req.receiverId, name: null, username: null, avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
        };
      }
    );
  }

  async listActivityFeed(_userId: string): Promise<FriendActivityFeedDTO[]> {
    return [];
  }

  seedTestUser(user: FriendUserDTO): void {
    demoUsersMap.set(user.id, user);
  }

  seedTestFriendship(userId: string, friendId: string, privacyLevel: PrivacyLevel = 'detailed'): void {
    memFriendships.push({
      id: `fship_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      friendId,
      privacyLevel,
      createdAt: new Date().toISOString(),
    });
  }
}

export const friendsRepository = new FriendsRepository();
