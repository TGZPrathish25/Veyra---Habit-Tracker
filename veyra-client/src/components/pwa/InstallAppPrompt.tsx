/**
 * InstallAppPrompt — Smart PWA installation banner capturing beforeinstallprompt event.
 */
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIosPromptVisible, setIsIosPromptVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('veyra_install_dismissed')) return;

    // Detect iOS Safari
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
      // Don't show immediately to prevent intrusive feeling; wait 6 seconds
      const timer = setTimeout(() => setIsIosPromptVisible(true), 6000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('veyra_install_dismissed', 'true');
    setIsVisible(false);
    setIsIosPromptVisible(false);
  };

  if (!isVisible && !isIosPromptVisible) return null;

  return (
    <aside
      role="banner"
      aria-label="Install Veyra Application"
      className="fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-40 max-w-sm w-[calc(100%-2rem)] glass p-4 rounded-2xl border border-purple-500/30 bg-purple-950/40 shadow-2xl backdrop-blur-xl animate-slideUp"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
          >
            V
          </div>
          <span className="text-fluid-xs font-bold text-purple-300 flex items-center gap-1">
            <Sparkles size={13} className="text-yellow-400" />
            Install Veyra App
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <p className="text-fluid-xs text-zinc-300 mb-3">
        {isIosPromptVisible
          ? 'Tap the Share icon in Safari, then select "Add to Home Screen" for instant offline habit tracking.'
          : 'Install Veyra on your device for fast access, native sound chimes, and offline habit tracking.'}
      </p>

      {isVisible && (
        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5"
          >
            <Download size={14} />
            <span>Install Now</span>
          </GlassButton>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-fluid-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      )}
    </aside>
  );
};
