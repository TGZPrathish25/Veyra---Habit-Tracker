/** Firebase Web SDK initialization, Auth and Firestore helpers. */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { env } from './env';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
const googleProvider = new GoogleAuthProvider();

export function isFirebaseConfigured(): boolean {
  return Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
}

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0
      ? initializeApp({
          apiKey: env.VITE_FIREBASE_API_KEY,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
          messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: env.VITE_FIREBASE_APP_ID,
        })
      : getApps()[0];

    auth = getAuth(app);
    // Ensure persistence across browser closures and sessions
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Failed to set Firebase auth browser persistence:', err);
    });
    db = getFirestore(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase Web SDK:', error);
  }
}

export { app, auth, db, googleProvider };

