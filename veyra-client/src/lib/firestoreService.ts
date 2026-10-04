/**
 * Firestore Client Service — Direct Cloud Firestore integration for Veyra
 * Adheres to firestore.rules security model (scoped by request.auth.uid)
 */
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface FirestoreUserProfile {
  uid: string;
  email?: string;
  name?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  timezone?: string;
  level?: number;
  xp?: number;
  currentStreak?: number;
  longestStreak?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreTask {
  id?: string;
  userId: string;
  title: string;
  category: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  cadence: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM';
  customDays?: number[];
  color?: string;
  icon?: string;
  dueTime?: string | null;
  dayDueTimes?: Record<string, string> | null;
  archived?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreTaskOccurrence {
  id?: string;
  taskId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: unknown;
  notes?: string;
}

export interface FirestoreWeeklyPlan {
  id?: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD
  title: string;
  targetCount: number;
  completedCount: number;
  createdAt?: unknown;
}

export interface FirestoreMonthlyGoal {
  id?: string;
  userId: string;
  yearMonth: string; // YYYY-MM
  title: string;
  targetCount: number;
  completedCount: number;
  notes?: string;
  createdAt?: unknown;
}

export const firestoreService = {
  /**
   * Sync/Create User Profile document in `users/{userId}`
   */
  async upsertUserProfile(profile: FirestoreUserProfile): Promise<void> {
    if (!db) return;
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(
      userRef,
      {
        ...profile,
        timezone: profile.timezone || 'Asia/Kolkata',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  /**
   * Fetch User Profile document from `users/{userId}`
   */
  async getUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
    if (!db) return null;
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as FirestoreUserProfile;
  },

  /**
   * Fetch all community user profiles for discovery
   */
  async getAllCommunityUsers(excludeUserId?: string): Promise<FirestoreUserProfile[]> {
    if (!db) return [];
    try {
      const usersColl = collection(db, 'users');
      const q = query(usersColl, limit(100));
      const snap = await getDocs(q);
      const results: FirestoreUserProfile[] = [];
      const seenIds = new Set<string>();
      const seenUsernames = new Set<string>();

      snap.forEach((d) => {
        const data = d.data() as FirestoreUserProfile;
        const uid = data.uid || d.id;
        const username = data.username?.toLowerCase().trim();
        const email = data.email?.toLowerCase().trim();

        // Filter out dummy/demo accounts
        if (
          d.id === 'usr_demo' ||
          uid === 'usr_demo' ||
          uid === 'demo' ||
          username === 'demo' ||
          data.name === 'Demo User' ||
          email?.includes('demo@')
        ) {
          return;
        }

        // Exclude caller's own ID
        if (excludeUserId && (d.id === excludeUserId || uid === excludeUserId)) {
          return;
        }

        // Deduplicate across documents that may share uid or username
        if (seenIds.has(d.id) || (data.uid && seenIds.has(data.uid))) return;
        if (username && seenUsernames.has(username)) return;

        seenIds.add(d.id);
        if (data.uid) seenIds.add(data.uid);
        if (username) seenUsernames.add(username);

        results.push({ ...data, uid });
      });
      return results;
    } catch {
      return [];
    }
  },

  /**
   * Save User Settings to `users/{userId}/settings/preferences`
   */
  async saveUserSettings(userId: string, settings: Record<string, unknown>): Promise<void> {
    if (!db) return;
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  /**
   * Fetch User Settings from `users/{userId}/settings/preferences`
   */
  async getUserSettings(userId: string): Promise<Record<string, unknown> | null> {
    if (!db) return null;
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) return null;
    return snap.data();
  },

  /**
   * Create a recurring Task
   */
  async createTask(userId: string, task: Omit<FirestoreTask, 'id' | 'userId'>): Promise<string | null> {
    if (!db) return null;
    const tasksColl = collection(db, 'tasks');
    const docRef = await addDoc(tasksColl, {
      ...task,
      userId,
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  /**
   * Fetch all active tasks for user
   */
  async getUserTasks(userId: string): Promise<FirestoreTask[]> {
    if (!db) return [];
    const tasksColl = collection(db, 'tasks');
    const q = query(tasksColl, where('userId', '==', userId), where('archived', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FirestoreTask, 'id'>),
    }));
  },

  /**
   * Update task definition
   */
  async updateTask(taskId: string, updates: Partial<FirestoreTask>): Promise<void> {
    if (!db) return;
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Archive/delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!db) return;
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  },

  /**
   * Record or toggle task completion occurrence for a specific date
   */
  async recordOccurrence(
    userId: string,
    taskId: string,
    date: string,
    completed: boolean
  ): Promise<void> {
    if (!db) return;
    const occurrenceId = `${userId}_${taskId}_${date}`;
    const occRef = doc(db, 'task_occurrences', occurrenceId);
    await setDoc(
      occRef,
      {
        userId,
        taskId,
        date,
        completed,
        completedAt: completed ? serverTimestamp() : null,
      },
      { merge: true }
    );
  },

  /**
   * Fetch occurrences for a given date
   */
  async getDailyOccurrences(userId: string, date: string): Promise<FirestoreTaskOccurrence[]> {
    if (!db) return [];
    const occColl = collection(db, 'task_occurrences');
    const q = query(occColl, where('userId', '==', userId), where('date', '==', date));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestoreTaskOccurrence, 'id'>),
    }));
  },

  /**
   * Save or update weekly plan
   */
  async saveWeeklyPlan(userId: string, plan: Omit<FirestoreWeeklyPlan, 'id' | 'userId'>): Promise<string | null> {
    if (!db) return null;
    const plansColl = collection(db, 'weekly_plans');
    const docRef = await addDoc(plansColl, {
      ...plan,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  /**
   * Get user weekly plans
   */
  async getWeeklyPlans(userId: string): Promise<FirestoreWeeklyPlan[]> {
    if (!db) return [];
    const plansColl = collection(db, 'weekly_plans');
    const q = query(plansColl, where('userId', '==', userId), orderBy('weekStartDate', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestoreWeeklyPlan, 'id'>),
    }));
  },

  /**
   * Save monthly goal
   */
  async saveMonthlyGoal(userId: string, goal: Omit<FirestoreMonthlyGoal, 'id' | 'userId'>): Promise<string | null> {
    if (!db) return null;
    const goalsColl = collection(db, 'monthly_goals');
    const docRef = await addDoc(goalsColl, {
      ...goal,
      userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  /**
   * Get monthly goals
   */
  async getMonthlyGoals(userId: string, yearMonth?: string): Promise<FirestoreMonthlyGoal[]> {
    if (!db) return [];
    const goalsColl = collection(db, 'monthly_goals');
    const q = yearMonth
      ? query(goalsColl, where('userId', '==', userId), where('yearMonth', '==', yearMonth))
      : query(goalsColl, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestoreMonthlyGoal, 'id'>),
    }));
  },

  /**
   * Real-time listener for daily occurrences
   */
  onDailyOccurrencesSnapshot(
    userId: string,
    date: string,
    callback: (occurrences: FirestoreTaskOccurrence[]) => void
  ): () => void {
    if (!db) return () => {};
    const occColl = collection(db, 'task_occurrences');
    const q = query(occColl, where('userId', '==', userId), where('date', '==', date));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreTaskOccurrence, 'id'>),
      }));
      callback(data);
    });
  },

  /**
   * Gamification telemetry in users/{userId}/gamification/status
   */
  async getGamificationStatus(userId: string) {
    if (!db) return null;
    const ref = doc(db, 'users', userId, 'gamification', 'status');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return {
        level: 1,
        totalXp: 0,
        currentLevelXp: 0,
        nextLevelXp: 100,
        progressPercentage: 0,
      };
    }
    return snap.data() as {
      level: number;
      totalXp: number;
      currentLevelXp: number;
      nextLevelXp: number;
      progressPercentage: number;
    };
  },

  /**
   * Add XP and calculate level progression directly in Firestore
   */
  async addXp(userId: string, xpDelta: number) {
    if (!db) return null;
    const ref = doc(db, 'users', userId, 'gamification', 'status');
    const current = (await this.getGamificationStatus(userId)) || {
      level: 1,
      totalXp: 0,
      currentLevelXp: 0,
      nextLevelXp: 100,
      progressPercentage: 0,
    };
    const currentTotal = typeof current.totalXp === 'number' && !isNaN(current.totalXp) ? current.totalXp : 0;
    const newTotal = Math.max(0, currentTotal + xpDelta);
    let level = 1;
    while (100 * level * (level - 1) <= newTotal) {
      level++;
    }
    level = Math.max(1, level - 1);
    const prevLevelThreshold = 100 * level * (level - 1);
    const nextLevelThreshold = 100 * (level + 1) * level;
    const range = nextLevelThreshold - prevLevelThreshold;
    const currentLvlXp = newTotal - prevLevelThreshold;
    const pct = range > 0 ? Math.min(100, Math.round((currentLvlXp / range) * 100)) : 0;

    const updated = {
      level,
      totalXp: newTotal,
      currentLevelXp: currentLvlXp,
      nextLevelXp: nextLevelThreshold,
      progressPercentage: pct,
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, updated, { merge: true });
    return updated;
  },

  /**
   * Get streaks
   */
  async getStreaks(userId: string) {
    if (!db) return { dailyStreak: 0, longestStreak: 0 };
    const ref = doc(db, 'users', userId, 'streaks', 'current');
    const snap = await getDoc(ref);
    if (!snap.exists()) return { dailyStreak: 1, longestStreak: 1 };
    return snap.data() as { dailyStreak: number; longestStreak: number };
  },

  /**
   * Notifications
   */
  async getNotifications(userId: string) {
    if (!db) return [];
    const notifsColl = collection(db, 'notifications');
    const q = query(notifsColl, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
    try {
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  },

  async markNotificationRead(notifId: string) {
    if (!db) return;
    const ref = doc(db, 'notifications', notifId);
    await updateDoc(ref, { read: true, readAt: serverTimestamp() });
  },

  /**
   * Provision default habits (no-op — clean slate for user)
   */
  async provisionDefaultsIfEmpty(_userId: string) {
    // Clean slate: do not auto-seed dummy tasks
    return;
  },
};
