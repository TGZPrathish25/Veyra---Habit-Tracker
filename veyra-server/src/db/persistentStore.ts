/**
 * Persistent Data Layer with Dual Firestore & Disk Persistence
 * Ensures user profiles, settings, tasks, and streaks are safely saved to database.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestoreAdmin } from '../config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export interface StoredUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  timezone: string;
  xp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSettings {
  theme: string;
  friendVisibilityLevel: number;
  leaderboardOptIn: boolean;
  deadlineAlertPrefs: unknown;
  notificationPrefs: unknown;
  challengePrefs: unknown;
  weekStartDay: number;
}

export interface StoredTask {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  color: string | null;
  isRecurring: boolean;
  daysOfWeek: number[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredOccurrence {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
  xpAwarded: number;
}

export interface StoredStreak {
  userId: string;
  type: string;
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

interface StoreSchema {
  users: Record<string, StoredUser>;
  settings: Record<string, StoredSettings>;
  tasks: Record<string, StoredTask>;
  occurrences: Record<string, StoredOccurrence>;
  streaks: Record<string, StoredStreak>;
  weeklyPlans: Record<string, any>;
  monthlyPlans: Record<string, any>;
  monthlySnapshots: Record<string, any>;
  challenges: Record<string, any>;
  participants: Record<string, any>;
  friendships: Record<string, any>;
  notifications: Record<string, any>;
}

class PersistentStore {
  private data: StoreSchema = {
    users: {},
    settings: {},
    tasks: {},
    occurrences: {},
    streaks: {},
    weeklyPlans: {},
    monthlyPlans: {},
    monthlySnapshots: {},
    challenges: {},
    participants: {},
    friendships: {},
    notifications: {},
  };

  private saveTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized) return;
    this.initialized = true;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          users: parsed.users || {},
          settings: parsed.settings || {},
          tasks: parsed.tasks || {},
          occurrences: parsed.occurrences || {},
          streaks: parsed.streaks || {},
        };
      }
    } catch (err) {
      console.warn('⚠️  Could not read local data store:', err);
    }

    // Seed default demo user if not present
    if (!this.data.users['usr_demo']) {
      this.data.users['usr_demo'] = {
        id: 'usr_demo',
        firebaseUid: 'demo',
        email: 'demo@veyra.app',
        name: 'Demo User',
        username: 'demo',
        avatarUrl: null,
        timezone: 'Asia/Kolkata',
        xp: 0,
        level: 1,
        createdAt: new Date('2026-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.settings['usr_demo'] = {
        theme: 'dark',
        friendVisibilityLevel: 2,
        leaderboardOptIn: true,
        deadlineAlertPrefs: null,
        notificationPrefs: null,
        challengePrefs: null,
        weekStartDay: 1,
      };
      this.scheduleSave();
    }
  }

  private scheduleSave(): void {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.flushToDisk();
    }, 100);
  }

  public flushToDisk(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to write data to disk store:', err);
    }
  }

  // --- Users & Settings ---

  public async saveUser(user: StoredUser): Promise<void> {
    this.data.users[user.id] = user;
    this.scheduleSave();

    // Mirror to Cloud Firestore
    const db = getFirestoreAdmin();
    if (db) {
      try {
        await db.collection('users').doc(user.id).set(user, { merge: true });
        if (user.firebaseUid && user.firebaseUid !== user.id) {
          await db.collection('users').doc(user.firebaseUid).set(user, { merge: true });
        }
      } catch (err) {
        console.debug('Cloud Firestore user write:', err);
      }
    }
  }

  public async getUserById(id: string): Promise<StoredUser | null> {
    const local = this.data.users[id];
    if (local) return local;

    // Check Cloud Firestore
    const db = getFirestoreAdmin();
    if (db) {
      try {
        const snap = await db.collection('users').doc(id).get();
        if (snap.exists) {
          const docData = snap.data() as StoredUser;
          this.data.users[docData.id || id] = docData;
          this.scheduleSave();
          return docData;
        }
      } catch (err) {
        console.debug('Cloud Firestore user read:', err);
      }
    }
    return null;
  }

  public async getUserByFirebaseUid(uid: string): Promise<StoredUser | null> {
    for (const u of Object.values(this.data.users)) {
      if (u.firebaseUid === uid) return u;
    }

    const db = getFirestoreAdmin();
    if (db) {
      try {
        // Direct doc check
        const directSnap = await db.collection('users').doc(uid).get();
        if (directSnap.exists) {
          const docData = directSnap.data() as StoredUser;
          this.data.users[docData.id || uid] = docData;
          this.scheduleSave();
          return docData;
        }

        // Query check
        const qSnap = await db.collection('users').where('firebaseUid', '==', uid).limit(1).get();
        if (!qSnap.empty) {
          const docData = qSnap.docs[0].data() as StoredUser;
          this.data.users[docData.id] = docData;
          this.scheduleSave();
          return docData;
        }
      } catch (err) {
        console.debug('Cloud Firestore getUserByFirebaseUid query:', err);
      }
    }
    return null;
  }

  public async getUserByUsername(username: string): Promise<StoredUser | null> {
    const normalized = username.toLowerCase();
    for (const u of Object.values(this.data.users)) {
      if (u.username?.toLowerCase() === normalized) return u;
    }

    const db = getFirestoreAdmin();
    if (db) {
      try {
        const qSnap = await db.collection('users').where('username', '==', normalized).limit(1).get();
        if (!qSnap.empty) {
          const docData = qSnap.docs[0].data() as StoredUser;
          this.data.users[docData.id] = docData;
          this.scheduleSave();
          return docData;
        }
      } catch (err) {
        console.debug('Cloud Firestore getUserByUsername query:', err);
      }
    }
    return null;
  }

  public async saveSettings(userId: string, settings: StoredSettings): Promise<void> {
    this.data.settings[userId] = settings;
    this.scheduleSave();

    const db = getFirestoreAdmin();
    if (db) {
      try {
        await db.collection('users').doc(userId).collection('settings').doc('preferences').set(settings, { merge: true });
      } catch (err) {
        console.debug('Cloud Firestore settings write:', err);
      }
    }
  }

  public async getSettings(userId: string): Promise<StoredSettings | null> {
    const local = this.data.settings[userId];
    if (local) return local;

    const db = getFirestoreAdmin();
    if (db) {
      try {
        const snap = await db.collection('users').doc(userId).collection('settings').doc('preferences').get();
        if (snap.exists) {
          const s = snap.data() as StoredSettings;
          this.data.settings[userId] = s;
          this.scheduleSave();
          return s;
        }
      } catch (err) {
        console.debug('Cloud Firestore getSettings:', err);
      }
    }
    return null;
  }

  public getAllUsers(): StoredUser[] {
    return Object.values(this.data.users);
  }

  // --- Tasks ---

  public async saveTask(task: StoredTask): Promise<void> {
    this.data.tasks[task.id] = task;
    this.scheduleSave();

    const db = getFirestoreAdmin();
    if (db) {
      try {
        await db.collection('tasks').doc(task.id).set(task, { merge: true });
      } catch (err) {
        console.debug('Cloud Firestore task write:', err);
      }
    }
  }

  public async getTasksByUser(userId: string): Promise<StoredTask[]> {
    const tasks = Object.values(this.data.tasks).filter((t) => t.userId === userId && t.isActive);
    if (tasks.length > 0) return tasks;

    const db = getFirestoreAdmin();
    if (db) {
      try {
        const qSnap = await db.collection('tasks').where('userId', '==', userId).where('isActive', '==', true).get();
        const loaded: StoredTask[] = [];
        for (const doc of qSnap.docs) {
          const t = doc.data() as StoredTask;
          this.data.tasks[t.id] = t;
          loaded.push(t);
        }
        if (loaded.length > 0) {
          this.scheduleSave();
          return loaded;
        }
      } catch (err) {
        console.debug('Cloud Firestore getTasksByUser:', err);
      }
    }
    return tasks;
  }

  public async getTaskById(taskId: string): Promise<StoredTask | null> {
    return this.data.tasks[taskId] || null;
  }

  public async deleteTask(taskId: string): Promise<void> {
    if (this.data.tasks[taskId]) {
      this.data.tasks[taskId].isActive = false;
      this.scheduleSave();
    }
    const db = getFirestoreAdmin();
    if (db) {
      try {
        await db.collection('tasks').doc(taskId).delete();
      } catch (err) {
        console.debug('Cloud Firestore deleteTask:', err);
      }
    }
  }

  // --- Occurrences ---

  public async saveOccurrence(occ: StoredOccurrence): Promise<void> {
    this.data.occurrences[occ.id] = occ;
    this.scheduleSave();

    const db = getFirestoreAdmin();
    if (db) {
      try {
        await db.collection('task_occurrences').doc(occ.id).set(occ, { merge: true });
      } catch (err) {
        console.debug('Cloud Firestore occurrence write:', err);
      }
    }
  }

  public async getOccurrencesByDate(userId: string, dateStr: string): Promise<StoredOccurrence[]> {
    return Object.values(this.data.occurrences).filter((o) => o.userId === userId && o.date === dateStr);
  }

  public async getOccurrenceById(id: string): Promise<StoredOccurrence | null> {
    return this.data.occurrences[id] || null;
  }

  // --- Streaks ---

  public async saveStreak(streak: StoredStreak): Promise<void> {
    const key = `${streak.userId}_${streak.type}`;
    this.data.streaks[key] = streak;
    this.scheduleSave();

    const db = getFirestoreAdmin();
    if (db) {
      try {
        await db.collection('streaks').doc(key).set(streak, { merge: true });
      } catch (err) {
        console.debug('Cloud Firestore streak write:', err);
      }
    }
  }

  public async getStreak(userId: string, type: string): Promise<StoredStreak | null> {
    const key = `${userId}_${type}`;
    const local = this.data.streaks[key];
    if (local) return local;

    const db = getFirestoreAdmin();
    if (db) {
      try {
        const snap = await db.collection('streaks').doc(key).get();
        if (snap.exists) {
          const s = snap.data() as StoredStreak;
          this.data.streaks[key] = s;
          this.scheduleSave();
          return s;
        }
      } catch (err) {
        console.debug('Cloud Firestore getStreak:', err);
      }
    }
    return null;
  }
}

export const persistentStore = new PersistentStore();
