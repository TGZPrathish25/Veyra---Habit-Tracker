import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassModal } from '@/components/glass/GlassModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePwa } from '@/lib/pwa';
import {
  User as UserIcon,
  Shield,
  Clock,
  Mail,
  Award,
  Zap,
  LogOut,
  Settings as SettingsIcon,
  Smartphone,
  Share,
  PlusSquare,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, settings, logout } = useAuth();
  const { isStandalone, isIos, promptInstall } = usePwa();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result === 'manual_ios' || result === 'manual_browser') {
      setShowInstallGuide(true);
    }
  };

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const nextLevelXp = level * 500;
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        subtitle="View your account standing, XP progression, and personal preferences."
      />

      <div className="max-w-3xl space-y-6">
        {/* User Hero Glass Card */}
        <div className="glass p-6 md:p-8 rounded-2xl relative overflow-hidden">
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                (user?.name || user?.email || 'V').charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-fluid-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {user?.name || 'Veyra Adventurer'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-block self-center sm:self-auto">
                  Level {level}
                </span>
              </div>
              <p className="text-fluid-sm font-mono" style={{ color: 'var(--color-primary)' }}>
                @{user?.username || 'user'}
              </p>

              {/* XP Progression Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-fluid-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Zap size={13} className="text-yellow-400" />
                    <span>Experience Points</span>
                  </span>
                  <span className="font-semibold text-white">
                    {xp} / {nextLevelXp} XP
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass p-5 rounded-2xl space-y-3">
            <h3 className="text-fluid-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <UserIcon size={18} className="text-blue-500" />
              <span>Account Info</span>
            </h3>
            <div className="space-y-2 text-fluid-sm">
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Mail size={15} />
                <span className="truncate">{user?.email || 'Not configured'}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Clock size={15} />
                <span>{user?.timezone || 'Asia/Kolkata'} (IST, UTC+05:30)</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Shield size={15} />
                <span>Privacy Level: {settings?.friendVisibilityLevel ?? 2} (out of 4)</span>
              </div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl space-y-3">
            <h3 className="text-fluid-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Award size={18} className="text-blue-500" />
              <span>Quick Actions</span>
            </h3>
            <div className="flex flex-col gap-2 pt-1">
              {!isStandalone && (
                <GlassButton
                  variant="primary"
                  onClick={handleInstall}
                  className="w-full justify-start gap-2.5 min-h-[44px] bg-gradient-to-r from-blue-600/30 to-violet-600/30 hover:from-blue-600/40 hover:to-violet-600/40 border-blue-500/40 text-blue-100 hover:text-white transition-all shadow-sm"
                >
                  <Smartphone size={16} className="text-blue-400" />
                  <span>Add to Home Screen</span>
                </GlassButton>
              )}
              <Link to="/settings">
                <GlassButton variant="ghost" className="w-full justify-start gap-2 min-h-[44px]">
                  <SettingsIcon size={16} />
                  <span>Edit Profile & Preferences</span>
                </GlassButton>
              </Link>
              <GlassButton
                variant="danger"
                onClick={handleLogout}
                className="w-full justify-start gap-2 min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Log Out of Veyra</span>
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Guide Modal (Shown when manual browser install step is needed) */}
      <GlassModal open={showInstallGuide} onClose={() => setShowInstallGuide(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
              >
                V
              </div>
              <div>
                <h3 className="text-fluid-base font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  Install Veyra App
                </h3>
                <p className="text-[11px] text-zinc-400">Add to your home screen for the full app experience</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {isIos ? (
            <div className="space-y-3 py-1 text-fluid-xs">
              <p className="text-zinc-300">Follow these 2 simple steps in Safari to add Veyra to your home screen:</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div className="text-zinc-200">
                    Tap the <strong className="text-white">Share</strong> button{' '}
                    <Share size={14} className="inline text-blue-400 mx-0.5" /> in the bottom toolbar of Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div className="text-zinc-200">
                    Scroll down and tap{' '}
                    <strong className="text-white">Add to Home Screen</strong>{' '}
                    <PlusSquare size={14} className="inline text-blue-400 mx-0.5" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </span>
                  <div className="text-zinc-200">
                    Tap <strong className="text-white">Add</strong> in the top right. Veyra will appear on your home screen with its app icon!
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-1 text-fluid-xs">
              <p className="text-zinc-300">To install Veyra on your device:</p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div className="text-zinc-200">
                    Tap the browser menu <strong className="text-white">(⋮ or ⋯)</strong> in the top right.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div className="text-zinc-200">
                    Select <strong className="text-white">"Install app"</strong> or{' '}
                    <strong className="text-white">"Add to Home screen"</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <GlassButton
              variant="primary"
              onClick={() => setShowInstallGuide(false)}
              className="w-full justify-center min-h-[42px]"
            >
              Got it
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </AppShell>
  );
};
