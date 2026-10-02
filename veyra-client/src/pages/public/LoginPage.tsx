/** Login page with glassmorphism design, validation, demo login, and Email / Google / Phone authentication. */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogIn, Sparkles, AlertCircle, ArrowRight, Phone, Mail, CheckCircle2, RotateCcw } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loginWithEmail,
    loginWithGoogle,
    loginAsDemo,
    sendPhoneCode,
    verifyPhoneCode,
    cancelPhoneAuth,
    phoneStep,
    pendingPhoneNumber,
    isSubmitting,
    authError,
    setAuthError,
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    const success = await loginWithEmail(email, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.trim();
    if (!cleaned || cleaned.length < 8) {
      setAuthError('Please enter a valid phone number with country code (e.g. +1 555 123 4567)');
      return;
    }

    const formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    const success = await sendPhoneCode(formatted, 'recaptcha-container');
    if (success) {
      setVerificationCode('');
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 4) {
      setAuthError('Please enter the verification code sent via SMS');
      return;
    }

    const success = await verifyPhoneCode(verificationCode.trim());
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async () => {
    const success = await loginAsDemo();
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="glass p-6 sm:p-8 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle gradient banner */}
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />

          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              <span className="text-2xl font-bold text-white">V</span>
            </div>
            <h1 className="text-fluid-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Welcome back
            </h1>
            <p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>
              Sign in to manage your day and keep your streak alive.
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

          {/* Quick Demo Action */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full mb-4 py-2.5 px-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 transition-all text-fluid-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span>One-Click Demo Login</span>
          </button>

          {/* Auth Method Switcher Tabs */}
          <div className="flex rounded-xl p-1 mb-5 bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                cancelPhoneAuth();
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-fluid-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'email'
                  ? 'bg-purple-600/60 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail size={14} />
              <span>Email & Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setAuthError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-fluid-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'phone'
                  ? 'bg-purple-600/60 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Phone size={14} />
              <span>Phone SMS</span>
            </button>
          </div>

          {authMethod === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <GlassInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-fluid-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-fluid-xs hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  className="glass-input w-full min-h-[44px]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 mt-2"
                disabled={isSubmitting}
              >
                <LogIn size={18} />
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              </GlassButton>
            </form>
          ) : (
            <div className="space-y-4">
              {phoneStep === 'idle' ? (
                <form onSubmit={handleSendPhoneCode} className="space-y-4">
                  <div>
                    <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      className="glass-input w-full min-h-[44px]"
                      placeholder="+1 555 123 4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-fluid-xs text-zinc-400">
                      Include country code (e.g. +1 for US/CA, +91 for India, +44 for UK).
                    </p>
                  </div>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Phone size={18} />
                    <span>{isSubmitting ? 'Sending Code...' : 'Send SMS Verification Code'}</span>
                  </GlassButton>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneCode} className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-fluid-xs text-purple-200">
                    Verification code sent to{' '}
                    <span className="font-semibold text-white">{pendingPhoneNumber || phoneNumber}</span>
                  </div>

                  <div>
                    <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                      6-Digit SMS Code
                    </label>
                    <input
                      type="text"
                      className="glass-input w-full min-h-[44px] tracking-widest text-center text-lg font-mono"
                      placeholder="123456"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 size={18} />
                    <span>{isSubmitting ? 'Verifying...' : 'Verify & Sign In'}</span>
                  </GlassButton>

                  <button
                    type="button"
                    onClick={cancelPhoneAuth}
                    disabled={isSubmitting}
                    className="w-full py-2 text-fluid-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Change phone number</span>
                  </button>
                </form>
              )}

              {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
              <div id="recaptcha-container" />
            </div>
          )}

          <div className="flex items-center my-4">
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
            <span className="px-3 text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
              or continue with Google
            </span>
            <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
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
            <span>Continue with Google</span>
          </button>

          <p className="mt-6 text-center text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium hover:underline inline-flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}
            >
              Sign up <ArrowRight size={12} />
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

