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

// In-memory friends catalog (used for testing)
const demoUsersMap = new Map<string, FriendUserDTO>();
const memFriendships: MemFriendship[] = [];
const memRequests: MemFriendRequest[] = [];

export class FriendsRepository {
  async findUserById(userId: string): Promise<FriendUserDTO | null> {
    return tryPrisma(
      async () => {
        const u = await prisma.user.findUnique({
          where: { id: userId },
          include: { gamification: true, streaks: { where: { type: 'daily' } } },
        });
        if (!u) {
          const stored = await persistentStore.getUserById(userId);
          if (!stored) return null;
          return {
            id: stored.id,
            name: stored.name,
            username: stored.username,
            avatarUrl: stored.avatarUrl,
            level: stored.level || 1,
            totalXp: stored.xp || 0,
            currentStreak: 0,
          };
        }
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
        const mem = demoUsersMap.get(userId);
        if (mem) return mem;
        const stored = persistentStore.getAllUsers().find((u) => u.id === userId);
        if (!stored) return null;
        return {
          id: stored.id,
          name: stored.name,
          username: stored.username,
          avatarUrl: stored.avatarUrl,
          level: stored.level || 1,
          totalXp: stored.xp || 0,
          currentStreak: 0,
        };
      }
    );
  }

  async findUserByUsername(username: string): Promise<FriendUserDTO | null> {
    const clean = username.toLowerCase().trim();

    return tryPrisma(
      async () => {
        const u = await prisma.user.findFirst({
          where: { username: { equals: clean, mode: 'insensitive' } },
          include: { gamification: true, streaks: { where: { type: 'daily' } } },
        });
        if (!u) {
          const stored = await persistentStore.getUserByUsername(clean);
          if (!stored) return null;
          return {
            id: stored.id,
            name: stored.name,
            username: stored.username,
            avatarUrl: stored.avatarUrl,
            level: stored.level || 1,
            totalXp: stored.xp || 0,
            currentStreak: 0,
          };
        }
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
        const stored = persistentStore.getAllUsers().find((u) => u.username?.toLowerCase() === clean);
        if (!stored) return null;
        return {
          id: stored.id,
          name: stored.name,
          username: stored.username,
          avatarUrl: stored.avatarUrl,
          level: stored.level || 1,
          totalXp: stored.xp || 0,
          currentStreak: 0,
        };
      }
    );
  }

  private isDummyUser(u: { id?: string; username?: string | null; email?: string | null; name?: string | null }): boolean {
    if (!u) return true;
    const BANNED_PATTERNS = [
      'mayachen', 'sam_t', 'samtaylor', 'alex_r', 'alexrivera',
      'jordan_lee', 'jordanlee', 'sarah_k', 'sarahkim',
      'elena_r', 'marcus_v', 'priya_s', 'demo'
    ];
    const BANNED_IDS = [
      'usr_mayachen', 'usr_samtaylor', 'usr_alexrivera', 'usr_jordanlee', 'usr_sarahkim',
      'usr_elena_r', 'usr_marcus_v', 'usr_priya_sharma', 'usr_demo', 'demo', 'mock'
    ];
    const BANNED_NAMES = [
      'sarah kim', 'jordan lee', 'alex rivera', 'sam taylor', 'maya chen',
      'elena rostova', 'marcus vance', 'priya sharma', 'demo user'
    ];

    if (u.id && BANNED_IDS.includes(u.id)) return true;
    const uName = u.username?.toLowerCase().trim() || '';
    const name = u.name?.toLowerCase().trim() || '';
    if (BANNED_PATTERNS.some((p) => uName === p || (p === 'demo' && uName.includes('demo')))) return true;
    if (BANNED_NAMES.some((n) => name === n)) return true;
    if (u.email && u.email.toLowerCase().includes('demo@')) return true;
    return false;
  }

  async listAllUsers(excludeUserId: string): Promise<FriendUserDTO[]> {
    return tryPrisma(
      async () => {
        const BANNED_PATTERNS = [
          'mayachen', 'sam_t', 'samtaylor', 'alex_r', 'alexrivera',
          'jordan_lee', 'jordanlee', 'sarah_k', 'sarahkim',
          'elena_r', 'marcus_v', 'priya_s', 'demo'
        ];
        const BANNED_IDS = [
          'usr_mayachen', 'usr_samtaylor', 'usr_alexrivera', 'usr_jordanlee', 'usr_sarahkim',
          'usr_elena_r', 'usr_marcus_v', 'usr_priya_sharma', 'usr_demo'
        ];

        const users = await prisma.user.findMany({
          where: {
            AND: [
              { id: { not: excludeUserId } },
              { id: { notIn: BANNED_IDS } },
              { username: { notIn: BANNED_PATTERNS } },
            ],
          },
          include: {
            gamification: true,
            streaks: { where: { type: 'daily' } },
          },
          take: 100,
          orderBy: { createdAt: 'desc' },
        });

        const seenIds = new Set<string>();
        const seenUsernames = new Set<string>();
        const mapped: FriendUserDTO[] = [];

        seenIds.add(excludeUserId);

        for (const u of users) {
          if (this.isDummyUser(u)) continue;
          if (u.id === excludeUserId || u.firebaseUid === excludeUserId) continue;

          const normUser = u.username?.toLowerCase().trim();
          if (seenIds.has(u.id) || (u.firebaseUid && seenIds.has(u.firebaseUid))) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          seenIds.add(u.id);
          if (u.firebaseUid) seenIds.add(u.firebaseUid);
          if (normUser) seenUsernames.add(normUser);

          mapped.push({
            id: u.id,
            name: u.name,
            username: u.username,
            avatarUrl: u.avatarUrl,
            level: u.gamification?.level ?? 1,
            totalXp: u.gamification?.totalXp ?? 0,
            currentStreak: u.streaks[0]?.current ?? 0,
          });
        }

        // Merge any registered users from persistent store not yet in Prisma
        const storedUsers = persistentStore.getAllUsers();
        for (const u of storedUsers) {
          if (this.isDummyUser(u)) continue;
          if (u.id === excludeUserId || u.firebaseUid === excludeUserId) continue;

          const normUser = u.username?.toLowerCase().trim();
          if (seenIds.has(u.id) || (u.firebaseUid && seenIds.has(u.firebaseUid))) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          seenIds.add(u.id);
          if (u.firebaseUid) seenIds.add(u.firebaseUid);
          if (normUser) seenUsernames.add(normUser);

          mapped.push({
            id: u.id,
            name: u.name,
            username: u.username,
            avatarUrl: u.avatarUrl,
            level: u.level || 1,
            totalXp: u.xp || 0,
            currentStreak: 0,
          });
        }

        return mapped;
      },
      () => {
        const result: FriendUserDTO[] = [];
        const seenIds = new Set<string>();
        const seenUsernames = new Set<string>();

        seenIds.add(excludeUserId);

        // 1. PersistentStore registered users
        const storedUsers = persistentStore.getAllUsers();
        for (const u of storedUsers) {
          if (this.isDummyUser(u)) continue;
          if (u.id === excludeUserId || u.firebaseUid === excludeUserId) continue;

          const normUser = u.username?.toLowerCase().trim();
          if (seenIds.has(u.id) || (u.firebaseUid && seenIds.has(u.firebaseUid))) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          seenIds.add(u.id);
          if (u.firebaseUid) seenIds.add(u.firebaseUid);
          if (normUser) seenUsernames.add(normUser);

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

        // 2. In-memory demoUsersMap (unit tests)
        for (const u of demoUsersMap.values()) {
          if (this.isDummyUser(u)) continue;
          if (u.id === excludeUserId) continue;

          const normUser = u.username?.toLowerCase().trim();
          if (seenIds.has(u.id)) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          seenIds.add(u.id);
          if (normUser) seenUsernames.add(normUser);
          result.push(u);
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
        return rows
          .filter((r) => !this.isDummyUser(r.friend))
          .map((r) => ({
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
        return userFriendships
          .map((f) => {
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
          })
          .filter((f) => !this.isDummyUser(f.friend));
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
