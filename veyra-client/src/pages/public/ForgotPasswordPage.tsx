/** Forgot Password page with glass design and reset link dispatch. */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, isSubmitting, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError('Please enter your email');
      return;
    }

    const ok = await resetPassword(email);
    if (ok) {
      setSubmitted(true);
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="glass p-6 sm:p-8 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />

          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              <KeyRound size={22} className="text-white" />
            </div>
            <h1 className="text-fluid-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Reset Password
            </h1>
            <p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>
              Enter your email address and we'll send you a link to reset your password.
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

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-fluid-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Reset Email Sent
              </h2>
              <p className="text-fluid-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                If an account exists for <strong className="text-white">{email}</strong>, you'll receive password reset instructions shortly.
              </p>
              <Link to="/login" className="inline-block mt-4">
                <GlassButton variant="primary">Return to Sign In</GlassButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <GlassInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <GlassButton
                type="submit"
                variant="primary"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 mt-4"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
              </GlassButton>
            </form>
          )}

          <p className="mt-6 text-center text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline inline-flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}
            >
              <ArrowLeft size={12} /> Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};
