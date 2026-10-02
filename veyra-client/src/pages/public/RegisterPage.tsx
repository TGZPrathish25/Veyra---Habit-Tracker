/** Register page with username verification, timezone detection, and validation. */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { UserPlus, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerWithEmail, loginWithGoogle, isSubmitting, authError, setAuthError } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');

  // Auto-detect client timezone
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    } catch {
      // Keep UTC
    }
  }, []);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await apiClient.get<{ data: { available: boolean } }>(
          `/users/check-username/${encodeURIComponent(username)}`
        );
        setUsernameStatus(res.data.data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      setAuthError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setAuthError('Please choose a valid and available username');
      return;
    }

    const success = await registerWithEmail(email, password, name, username);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="glass p-6 sm:p-8 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden my-6">
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />

          <div className="text-center mb-6">
            <h1 className="text-fluid-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Create your account
            </h1>
            <p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>
              Start your productivity journey with Veyra.
            </p>
          </div>

          {authError && (
            <div
              className="mb-5 p-3 rounded-lg flex items-center gap-2 text-fluid-xs bg-red-500/10 border border-red-500/20 text-red-300"
              role="alert"
            >
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <div>
                <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="glass-input w-full min-h-[44px] pr-8"
                    placeholder="janedoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? (
                      <Loader2 size={16} className="animate-spin text-purple-400" />
                    ) : usernameStatus === 'available' ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : usernameStatus === 'taken' || usernameStatus === 'invalid' ? (
                      <AlertCircle size={16} className="text-red-400" />
                    ) : null}
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-[11px] text-red-400 mt-1">Username is already taken</p>
                )}
                {usernameStatus === 'invalid' && (
                  <p className="text-[11px] text-red-400 mt-1">Letters, numbers, and underscores only</p>
                )}
              </div>
            </div>

            <GlassInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="glass-input w-full min-h-[44px]"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="glass-input w-full min-h-[44px]"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Timezone (auto-detected)
              </label>
              <input
                type="text"
                className="glass-input w-full min-h-[44px] opacity-80"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 mt-4"
              disabled={isSubmitting}
            >
              <UserPlus size={18} />
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
            </GlassButton>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
            <span className="px-3 text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
              or continue with Google
            </span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
          </div>

          <button
            type="button"
            onClick={async () => {
              const success = await loginWithGoogle();
              if (success) navigate('/dashboard', { replace: true });
            }}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-fluid-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
            style={{ color: 'var(--color-text)' }}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <p className="mt-6 text-center text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline inline-flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}
            >
              <ArrowLeft size={12} /> Sign in with Email or Phone
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

