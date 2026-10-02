/**
 * AboutPage — Comprehensive presentation of Veyra's philosophy, non-negotiable principles, architecture, and technology.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassButton } from '@/components/glass/GlassButton';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  Lock,
  Zap,
  Target,
  Users,
  Trophy,
  Flame,
  ArrowRight,
  Code2,
  Database,
  Cpu,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
        {/* Hero Section */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-fluid-xs font-semibold">
            <Sparkles size={14} className="text-yellow-400" />
            <span>The Veyra Philosophy</span>
          </div>
          <h1 className="text-fluid-3xl sm:text-fluid-4xl font-extrabold text-white tracking-tight max-w-3xl mx-auto">
            Build your day.{' '}
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Track your growth.
            </span>
          </h1>
          <p className="text-fluid-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Veyra is a privacy-first personal productivity and social accountability platform designed to transform ephemeral daily routines into lasting lifelong disciplines.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/register">
              <GlassButton variant="primary" size="lg" className="flex items-center gap-2">
                <span>Start Tracking Now</span>
                <ArrowRight size={18} />
              </GlassButton>
            </Link>
            <Link to="/login">
              <GlassButton variant="secondary" size="lg">
                Sign In
              </GlassButton>
            </Link>
          </div>
        </section>

        {/* 4 Non-Negotiable Core Rules */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-fluid-xl font-bold text-white">4 Non-Negotiable Design Principles</h2>
            <p className="text-fluid-xs text-zinc-400 mt-1">
              Engineered with architectural discipline to ensure true accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-fluid-base font-semibold text-white">1. Sovereign Task Ownership</h3>
              <p className="text-fluid-xs text-zinc-400 leading-relaxed">
                Everyone strictly owns their own habits and occurrences. There are no shared, pair, or group tasks. When friends challenge each other, private challenge tasks are injected into your personal checklist.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                <Calendar size={20} />
              </div>
              <h3 className="text-fluid-base font-semibold text-white">2. Dated Immutable Occurrences</h3>
              <p className="text-fluid-xs text-zinc-400 leading-relaxed">
                Completion status belongs strictly to a calendar-dated occurrence, never to the recurring template. We never reset a boolean at midnight, preserving historical integrity forever.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <Lock size={20} />
              </div>
              <h3 className="text-fluid-base font-semibold text-white">3. Immutable Historical Archives</h3>
              <p className="text-fluid-xs text-zinc-400 leading-relaxed">
                Historical data is never deleted automatically. Past months automatically lock and convert into permanent snapshots and calendar heatmaps that document your lifelong progression.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <h3 className="text-fluid-base font-semibold text-white">4. Distinct Modular Engines</h3>
              <p className="text-fluid-xs text-zinc-400 leading-relaxed">
                Daily habits, Sunday weekly planning rituals, monthly goals, social accountability, challenges, and permanent history are independent decoupled modules linked through your user profile.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-fluid-xl font-bold text-white">Engineered for Habit Mastery</h2>
            <p className="text-fluid-xs text-zinc-400 mt-1">
              Every detail is tailored to provide frictionless habit logging and rich audio-visual feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <Flame size={24} className="text-orange-400" />
              <h4 className="text-fluid-sm font-semibold text-white">Multi-Tier Streaks</h4>
              <p className="text-fluid-xs text-zinc-400">
                Daily, weekly, and monthly consecutive streaks with animated flame badge thresholds and personal best records.
              </p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <Trophy size={24} className="text-yellow-400" />
              <h4 className="text-fluid-sm font-semibold text-white">RPG Progression & Chimes</h4>
              <p className="text-fluid-xs text-zinc-400">
                Quadratic XP leveling curve, 12 achievement trophies, and zero-asset synthesized Web Audio harmonic chimes and fanfares.
              </p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <Users size={24} className="text-purple-400" />
              <h4 className="text-fluid-sm font-semibold text-white">4-Tier Privacy Masking</h4>
              <p className="text-fluid-xs text-zinc-400">
                Control exactly what friends see: Level 1 (Daily % only), Level 2 (Task Counts), Level 3 (Habit Titles), or Level 4 (Full).
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack Details */}
        <section className="glass p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300">
              <Code2 size={24} />
            </div>
            <div>
              <h3 className="text-fluid-lg font-bold text-white">Architecture & Technology</h3>
              <p className="text-fluid-xs text-zinc-400">
                Built with modern web standards and zero external runtime dependencies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-fluid-xs">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
              <span className="font-bold text-purple-300">Frontend Layer</span>
              <p className="text-zinc-400">React 18, Vite, TypeScript, Tailwind CSS, TanStack Query 5, Zustand, Recharts, Lucide React</p>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
              <span className="font-bold text-blue-300">Cloud & Data Layer</span>
              <p className="text-zinc-400">Firebase Authentication (Email, Google, Phone), Cloud Firestore real-time sync, Firebase Hosting</p>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
              <span className="font-bold text-emerald-300">Backend & API Layer</span>
              <p className="text-zinc-400">Node.js, Express 4, Prisma ORM, PostgreSQL 16, Socket.IO, node-cron, Gemini AI API</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-8 space-y-4">
          <h2 className="text-fluid-2xl font-bold text-white">Ready to elevate your daily routine?</h2>
          <p className="text-fluid-xs text-zinc-400 max-w-md mx-auto">
            Join Veyra today. Build streaks, conquer challenges, and experience true personal accountability.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <GlassButton variant="primary" size="lg" className="px-8 shadow-xl">
                Get Started Free
              </GlassButton>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
