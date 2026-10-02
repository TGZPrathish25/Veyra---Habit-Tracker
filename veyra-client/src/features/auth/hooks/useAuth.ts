import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/config/firebase';
import { firestoreService } from '@/lib/firestoreService';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import type { User, UserSettings } from '../types';
import { INDIA_TIMEZONE } from '@/lib/date';

let appRecaptchaVerifier: RecaptchaVerifier | null = null;
let activeConfirmationResult: ConfirmationResult | null = null;

export function useAuth() {
  const { user, settings, token, isAuthenticated, isLoading, setAuth, clearAuth, updateUser, updateSettings } =
    useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'idle' | 'code_sent'>('idle');
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string>('');

  const handleAuthSuccess = async (userData: User, userSettings: UserSettings | null, userToken: string) => {
    setAuth(userData, userSettings, userToken);
    try {
      const firestoreUid = auth?.currentUser?.uid || userData.firebaseUid || userData.id;
      await firestoreService.upsertUserProfile({
        uid: firestoreUid,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        avatarUrl: userData.avatarUrl,
        timezone: userData.timezone,
        level: userData.level,
        xp: userData.xp,
      });

      if (userSettings) {
        await firestoreService.saveUserSettings(firestoreUid, userSettings as unknown as Record<string, unknown>);
      }
    } catch (err) {
      console.debug('Firestore user profile sync:', err);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      let idToken = `dev-token:${email.split('@')[0]}:${email}`;
      let displayName = email.split('@')[0];

      if (isFirebaseConfigured() && auth) {
        const credential = await signInWithEmailAndPassword(auth, email, pass);
        idToken = await credential.user.getIdToken();
        displayName = credential.user.displayName || displayName;
      }

      const syncResult = await authApi.syncUser(
        {
          email,
          name: displayName,
          timezone: INDIA_TIMEZONE,
        },
        idToken
      );

      await handleAuthSuccess(syncResult.user, syncResult.settings, idToken);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };


  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    username: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      let idToken = `dev-token:${username}:${email}`;

      if (isFirebaseConfigured() && auth) {
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        idToken = await credential.user.getIdToken();
      }

      const syncResult = await authApi.syncUser(
        {
          email,
          name,
          username,
          timezone: INDIA_TIMEZONE,
        },
        idToken
      );

      await handleAuthSuccess(syncResult.user, syncResult.settings, idToken);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      let idToken = 'dev-token:google_user:google_user@veyra.app';
      let email = 'google_user@veyra.app';
      let name = 'Google User';
      let photoURL: string | null = null;

      if (isFirebaseConfigured() && auth) {
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
        email = result.user.email || email;
        name = result.user.displayName || name;
        photoURL = result.user.photoURL;
      }

      const syncResult = await authApi.syncUser(
        {
          email,
          name,
          avatarUrl: photoURL,
          timezone: INDIA_TIMEZONE,
        },
        idToken
      );

      await handleAuthSuccess(syncResult.user, syncResult.settings, idToken);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendPhoneCode = async (phoneNumber: string, containerId = 'recaptcha-container'): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      setPendingPhoneNumber(phoneNumber);

      if (isFirebaseConfigured() && auth) {
        if (!appRecaptchaVerifier) {
          appRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved
            },
          });
        }
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appRecaptchaVerifier);
        activeConfirmationResult = confirmation;
        setPhoneStep('code_sent');
        return true;
      } else {
        // Fallback for demo / development mode
        setPhoneStep('code_sent');
        return true;
      }
    } catch (err: unknown) {
      if (appRecaptchaVerifier) {
        try {
          appRecaptchaVerifier.clear();
        } catch {
          // ignore
        }
        appRecaptchaVerifier = null;
      }
      const msg = err instanceof Error ? err.message : 'Failed to send SMS verification code';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyPhoneCode = async (code: string): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const phoneDigits = pendingPhoneNumber.replace(/\D/g, '') || '5551234';
      let idToken = `dev-token:phone_${phoneDigits}:${phoneDigits}@phone.veyra.app`;
      let displayName = `User (${pendingPhoneNumber || 'Phone'})`;
      const email = `${phoneDigits}@phone.veyra.app`;

      if (isFirebaseConfigured() && auth && activeConfirmationResult) {
        const userCredential = await activeConfirmationResult.confirm(code);
        idToken = await userCredential.user.getIdToken();
        displayName = userCredential.user.displayName || userCredential.user.phoneNumber || displayName;
      }

      const syncResult = await authApi.syncUser(
        {
          email,
          name: displayName,
          timezone: INDIA_TIMEZONE,
        },
        idToken
      );

      await handleAuthSuccess(syncResult.user, syncResult.settings, idToken);
      setPhoneStep('idle');
      activeConfirmationResult = null;
      setPendingPhoneNumber('');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid SMS verification code';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelPhoneAuth = () => {
    setPhoneStep('idle');
    setPendingPhoneNumber('');
    activeConfirmationResult = null;
    setAuthError(null);
  };

  const loginAsDemo = async (): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const demoToken = 'dev-token:demo:demo@veyra.app';
      const syncResult = await authApi.syncUser(
        {
          email: 'demo@veyra.app',
          name: 'Demo User',
          username: 'demo',
          timezone: INDIA_TIMEZONE,
        },
        demoToken
      );

      await handleAuthSuccess(syncResult.user, syncResult.settings, demoToken);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo login failed';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isFirebaseConfigured() && auth) {
        await signOut(auth);
      }
      await authApi.logout().catch(() => {});
    } finally {
      clearAuth();
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured() && auth) {
        await sendPasswordResetEmail(auth, email);
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setAuthError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    settings,
    token,
    isAuthenticated,
    isLoading,
    isSubmitting,
    authError,
    phoneStep,
    pendingPhoneNumber,
    setAuthError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendPhoneCode,
    verifyPhoneCode,
    cancelPhoneAuth,
    loginAsDemo,
    logout,
    resetPassword,
    updateUser,
    updateSettings,
  };
}

