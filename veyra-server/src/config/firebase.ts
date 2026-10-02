/** Firebase Admin SDK initialization and ID token verification. */
import admin from 'firebase-admin';
import { env } from './env.js';

let initialized = false;

export function initFirebase(): void {
  if (initialized) return;

  if (!env.FIREBASE_SERVICE_ACCOUNT) {
    if (env.ALLOW_DEV_AUTH) {
      console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT not set — development auth bypass is enabled');
    } else {
      console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT not set — auth middleware will reject all requests');
    }
    return;
  }

  try {
    let serviceAccount: admin.ServiceAccount;
    // Handle base64 encoded or direct JSON string
    if (env.FIREBASE_SERVICE_ACCOUNT.startsWith('{')) {
      serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      const decoded = Buffer.from(env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.info('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
}

export function getFirestoreAdmin(): admin.firestore.Firestore | null {
  if (process.env.NODE_ENV === 'test' && !process.env.TEST_WITH_FIRESTORE) return null;
  if (!initialized) {
    initFirebase();
  }
  if (!initialized) return null;
  return admin.firestore();
}

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function verifyFirebaseToken(token: string): Promise<DecodedAuthToken> {
  // Support local dev / test mock tokens when allowed
  if (env.ALLOW_DEV_AUTH && (token.startsWith('dev-token:') || token.startsWith('mock-token:') || token === 'demo-token')) {
    const parts = token.split(':');
    const uid = parts[1] || 'demo-firebase-uid';
    const email = parts[2] || `${uid}@veyra.app`;
    return {
      uid,
      email,
      name: uid.charAt(0).toUpperCase() + uid.slice(1),
    };
  }

  if (!initialized) {
    throw new Error('Firebase Admin SDK is not initialized and dev auth is disabled');
  }

  const decoded = await admin.auth().verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
  };
}
