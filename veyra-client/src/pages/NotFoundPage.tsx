/**
 * NotFoundPage — 404 error page with glassmorphism graphics and instant return actions.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GlassButton } from '@/components/glass/GlassButton';
import { Compass, Home, ArrowLeft, Calendar, Flame } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
        <div className="glass p-8 sm:p-12 w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl text-center relative overflow-hidden">
          {/* Subtle gradient banner */}
          <div
            className="absolute top-0 inset-x-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #ec4899)' }}
          />

          {/* 404 Icon & Large Number */}
          <div className="mb-6 relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Compass size={40} className="animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div className="text-fluid-4xl font-black text-white/10 absolute -bottom-4 inset-x-0 select-none">
              404
            </div>
          </div>

          <h1 className="text-fluid-2xl font-bold text-white mb-2 tracking-tight">
            Lost in the Productive Void?
          </h1>
          <p className="text-fluid-xs text-zinc-300 max-w-sm mx-auto mb-8 leading-relaxed">
            The page or habit snapshot you are looking for does not exist or has been locked away in the archives.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <GlassButton variant="primary" className="w-full flex items-center justify-center gap-2">
                <Home size={16} />
                <span>Go to Dashboard</span>
              </GlassButton>
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-fluid-xs text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Helpful Links */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6 text-fluid-xs text-zinc-400">
            <Link to="/daily" className="hover:text-purple-300 flex items-center gap-1.5 transition-colors">
              <Calendar size={13} />
              <span>Daily Tasks</span>
            </Link>
            <Link to="/challenges" className="hover:text-orange-300 flex items-center gap-1.5 transition-colors">
              <Flame size={13} />
              <span>Challenges</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
