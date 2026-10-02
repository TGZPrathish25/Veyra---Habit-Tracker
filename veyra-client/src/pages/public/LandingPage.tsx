/** Landing page with hero, features, and CTA. */
import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const LandingPage: React.FC = () => {
  return (
    <PublicLayout>
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-6 sm:mb-8"
               style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
            <span className="text-3xl sm:text-4xl font-bold text-white">V</span>
          </div>
          <h1 className="text-fluid-5xl font-bold mb-4 sm:mb-6">
            <span style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Veyra
            </span>
          </h1>
          <p className="text-fluid-2xl font-medium mb-3 sm:mb-4" style={{ color: 'var(--color-text)' }}>
            Build your day. Track your growth.
          </p>
          <p className="text-fluid-lg mb-8 sm:mb-10 max-w-2xl mx-auto px-4" style={{ color: 'var(--color-text-muted)' }}>
            A gamified habit tracker with daily routines, weekly plans, monthly goals,
            social challenges, and beautiful analytics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a href="/register" className="glass-button glass-button-primary w-full sm:w-auto px-8 py-3 text-fluid-base">
              Get Started Free
            </a>
            <a href="/login" className="glass-button glass-button-ghost w-full sm:w-auto px-8 py-3 text-fluid-base">
              Sign In
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-20">
            <div className="glass p-4 sm:p-6 text-center"><div className="text-3xl sm:text-4xl mb-3">🎯</div><h3 className="text-fluid-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Daily Habits</h3><p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>Build routines that stick</p></div>
            <div className="glass p-4 sm:p-6 text-center"><div className="text-3xl sm:text-4xl mb-3">🔥</div><h3 className="text-fluid-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Streaks & XP</h3><p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>Gamified progress tracking</p></div>
            <div className="glass p-4 sm:p-6 text-center"><div className="text-3xl sm:text-4xl mb-3">👥</div><h3 className="text-fluid-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Social</h3><p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>Challenge friends, climb leaderboards</p></div>
          </div>
        </div>
      </section>
      <footer className="py-6 text-center text-fluid-xs" style={{ color: 'var(--color-text-muted)' }}>
        &copy; 2026 Veyra. All rights reserved.
      </footer>
    </PublicLayout>
  );
};
