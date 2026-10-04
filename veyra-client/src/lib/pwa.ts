/**
 * PWA installation state management & standalone detection for Veyra.
 */
import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

/**
 * Checks if the application is currently running as an installed standalone app
 * (i.e. launched from home screen / dock on mobile or desktop).
 */
export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const isMinimalUi = window.matchMedia?.('(display-mode: minimal-ui)')?.matches;
  const isFullscreen = window.matchMedia?.('(display-mode: fullscreen)')?.matches;
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean })?.standalone === true;
  const isAndroidApp = typeof document !== 'undefined' && document.referrer?.includes('android-app://');

  return Boolean(isStandaloneMedia || isMinimalUi || isFullscreen || isIosStandalone || isAndroidApp);
}

/**
 * Detects if user is browsing from an iOS device (iPhone / iPad / iPod)
 */
export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

// Global listeners initialized once on module load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb());
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((cb) => cb());
  });
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function clearDeferredPrompt(): void {
  deferredPrompt = null;
  listeners.forEach((cb) => cb());
}

export function subscribePwa(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type InstallResult = 'accepted' | 'dismissed' | 'manual_ios' | 'manual_browser';

export function usePwa() {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => isStandaloneApp());
  const [hasPrompt, setHasPrompt] = useState<boolean>(() => getDeferredPrompt() !== null);
  const [isIos, setIsIos] = useState<boolean>(() => isIosDevice());

  useEffect(() => {
    setIsStandalone(isStandaloneApp());
    setHasPrompt(getDeferredPrompt() !== null);
    setIsIos(isIosDevice());

    const unsubscribe = subscribePwa(() => {
      setHasPrompt(getDeferredPrompt() !== null);
      setIsStandalone(isStandaloneApp());
    });

    const mql = window.matchMedia?.('(display-mode: standalone)');
    const handleMql = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || isStandaloneApp());
    };
    mql?.addEventListener('change', handleMql);

    return () => {
      unsubscribe();
      mql?.removeEventListener('change', handleMql);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallResult> => {
    const prompt = getDeferredPrompt();
    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          clearDeferredPrompt();
          setIsStandalone(true);
        }
        return choice.outcome;
      } catch {
        return 'manual_browser';
      }
    }

    if (isIos && !isStandalone) {
      return 'manual_ios';
    }

    return 'manual_browser';
  }, [isIos, isStandalone]);

  return {
    isStandalone,
    canInstall: !isStandalone,
    hasPrompt,
    isIos,
    promptInstall,
  };
}
