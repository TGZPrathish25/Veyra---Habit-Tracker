/** Settings tabs — Account, Appearance, Privacy & Friends, Notifications. */
import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { firestoreService } from '@/lib/firestoreService';
import { auth } from '@/config/firebase';
import { useThemeStore, type Theme } from '@/store/themeStore';
import {
  User as UserIcon,
  Palette,
  Shield,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  Volume2,
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playHabitChime } from '@/lib/sound';

type Tab = 'account' | 'appearance' | 'privacy' | 'notifications';

export const SettingsPage: React.FC = () => {
  const { user, settings, updateUser, updateSettings } = useAuth();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<Tab>('account');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [friendVisibility, setFriendVisibility] = useState(settings?.friendVisibilityLevel ?? 2);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(settings?.leaderboardOptIn ?? true);

  const [pushNotifs, setPushNotifs] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(() => isSoundEnabled());

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state if user hydrates
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.username) setUsername(user.username);
      if (user.timezone) setTimezone(user.timezone);
    }
  }, [user]);

  // Sync state if settings hydrate
  useEffect(() => {
    if (settings) {
      if (settings.friendVisibilityLevel !== undefined) {
        setFriendVisibility(settings.friendVisibilityLevel);
      }
      if (settings.leaderboardOptIn !== undefined) {
        setLeaderboardOptIn(settings.leaderboardOptIn);
      }
      if (settings.notificationPrefs && typeof settings.notificationPrefs === 'object') {
        const notifs = settings.notificationPrefs as { push?: boolean; deadlines?: boolean };
        if (notifs.push !== undefined) setPushNotifs(notifs.push);
        if (notifs.deadlines !== undefined) setDeadlineAlerts(notifs.deadlines);
      }
    }
  }, [settings]);

  // Fetch freshest profile & settings on mount
  useEffect(() => {
    apiClient
      .get<{ data: { user?: { name?: string; username?: string; timezone?: string }; settings?: Record<string, unknown> } }>('/users/me')
      .then((res) => {
        if (res.data?.data?.user) updateUser(res.data.data.user);
        if (res.data?.data?.settings) updateSettings(res.data.data.settings);
      })
      .catch(() => {});
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      try {
        const res = await apiClient.patch<{ data: { name: string; username: string; timezone: string } }>(
          '/users/me',
          { name, username, timezone }
        );
        if (res.data?.data) {
          updateUser(res.data.data);
        } else {
          updateUser({ name, username, timezone });
        }
      } catch (apiErr) {
        console.warn('Server updateMe failed, falling back locally:', apiErr);
        updateUser({ name, username, timezone });
      }

      const firestoreUid = auth?.currentUser?.uid || user?.firebaseUid || user?.id;
      if (firestoreUid) {
        await firestoreService.upsertUserProfile({
          uid: firestoreUid,
          name,
          username,
          timezone,
        }).catch((err) => console.warn('Firestore upsertUserProfile warning:', err));
      }
      setMessage({ type: 'success', text: 'Account profile updated successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update account';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);
    const payload = {
      theme,
      friendVisibilityLevel: Number(friendVisibility),
      leaderboardOptIn,
      notificationPrefs: { push: pushNotifs, deadlines: deadlineAlerts },
    };
    try {
      setTheme(theme);
      try {
        await apiClient.patch('/users/me/settings', payload);
      } catch (apiErr) {
        console.warn('Server updateSettings failed, falling back locally:', apiErr);
      }
      updateSettings(payload);

      const firestoreUid = auth?.currentUser?.uid || user?.firebaseUid || user?.id;
      if (firestoreUid) {
        await firestoreService.saveUserSettings(firestoreUid, payload)
          .catch((err) => console.warn('Firestore saveUserSettings warning:', err));
      }

      setMessage({ type: 'success', text: 'Settings preferences saved successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, theme, privacy levels, and notification preferences."
      />

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-fluid-sm border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto gap-2" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 pb-3 px-3 text-fluid-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'account'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent hover:text-gray-900 dark:hover:text-white text-gray-400'
          }`}
        >
          <UserIcon size={16} />
          <span>Account</span>
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 pb-3 px-3 text-fluid-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'appearance'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent hover:text-gray-900 dark:hover:text-white text-gray-400'
          }`}
        >
          <Palette size={16} />
          <span>Appearance</span>
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 pb-3 px-3 text-fluid-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'privacy'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent hover:text-gray-900 dark:hover:text-white text-gray-400'
          }`}
        >
          <Shield size={16} />
          <span>Privacy & Friends</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 pb-3 px-3 text-fluid-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'notifications'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent hover:text-gray-900 dark:hover:text-white text-gray-400'
          }`}
        >
          <Bell size={16} />
          <span>Notifications</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="glass p-6 md:p-8 rounded-2xl max-w-2xl">
        {activeTab === 'account' && (
          <form onSubmit={handleSaveAccount} className="space-y-5">
            <GlassInput
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <GlassInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
            />
            <div>
              <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Timezone
              </label>
              <input
                type="text"
                className="glass-input w-full min-h-[44px]"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
              />
              <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Fixed to Indian Standard Time (Asia/Kolkata, UTC+05:30) for accurate habit tracking and midnight resets.
              </p>
            </div>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex items-center gap-2 min-h-[44px] px-6"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </GlassButton>
          </form>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-fluid-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Theme Preset
              </h3>
              <p className="text-fluid-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Choose the visual style for cards, blur effects, and interface elements.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'dark', label: 'Dark Glass', desc: 'Deep cosmic dark palette' },
                  { id: 'ambient', label: 'Ambient Glow', desc: 'Vivid blue backlight' },
                  { id: 'light', label: 'Light Frost', desc: 'Bright frosted glass' },
                  { id: 'system', label: 'System', desc: 'Follow your OS preference' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTheme(preset.id as Theme)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      theme === preset.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-fluid-sm" style={{ color: 'var(--color-text)' }}>
                      {preset.label}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <GlassButton onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Appearance'}</span>
            </GlassButton>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-fluid-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Friend Privacy Level
              </h3>
              <p className="text-fluid-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Controls what connected friends can see about your productivity.
              </p>
              <div className="space-y-2">
                {[
                  { level: 1, label: 'Level 1: Overall percentage only', desc: 'Friends only see your overall daily completion %.' },
                  { level: 2, label: 'Level 2: Percentage + counts', desc: 'Friends see your % and completed/total counts.' },
                  { level: 3, label: 'Level 3: Task names + status', desc: 'Friends see task titles and completed checks.' },
                  { level: 4, label: 'Level 4: Full profile', desc: 'Friends see daily, weekly, monthly, and streak summaries.' },
                ].map((item) => (
                  <label
                    key={item.level}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      friendVisibility === item.level
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="friendVisibility"
                      checked={friendVisibility === item.level}
                      onChange={() => setFriendVisibility(item.level)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-fluid-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {item.label}
                      </div>
                      <div className="text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-fluid-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Opt-in to Friends Leaderboard
                  </div>
                  <div className="text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Display your weekly XP and completion % on friends-only leaderboards.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={leaderboardOptIn}
                  onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
              </label>
            </div>

            <GlassButton onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Privacy'}</span>
            </GlassButton>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-white/10 hover:border-white/20">
                <div>
                  <div className="text-fluid-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Push & In-App Notifications
                  </div>
                  <div className="text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Receive real-time notifications for friend activities and challenges.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-white/10 hover:border-white/20">
                <div>
                  <div className="text-fluid-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Deadline Urgency Alerts
                  </div>
                  <div className="text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Show popups when tasks are approaching (&lt;3h) or urgent (&lt;30m).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={deadlineAlerts}
                  onChange={(e) => setDeadlineAlerts(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
              </label>

              <div className="p-3 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-between">
                <div>
                  <div className="text-fluid-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Volume2 size={16} className="text-blue-500" />
                    <span>Reward Audio Effects</span>
                  </div>
                  <div className="text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Play synthesized chimes on habit check-off, level up fanfares, and streak boosts.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => playHabitChime()}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Test Chime
                  </button>
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={(e) => {
                      setSoundEffects(e.target.checked);
                      setSoundEnabled(e.target.checked);
                    }}
                    className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <GlassButton onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Notifications'}</span>
            </GlassButton>
          </div>
        )}
      </div>
    </AppShell>
  );
};
