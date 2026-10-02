/** Route table — lazy-loaded pages with ProtectedRoute and PublicOnlyRoute guards. */
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicOnlyRoute } from './guards/PublicOnlyRoute';

const LandingPage = lazy(() => import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/public/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const DailyTasksPage = lazy(() => import('@/pages/DailyTasksPage').then((m) => ({ default: m.DailyTasksPage })));
const WeeklyTasksPage = lazy(() => import('@/pages/WeeklyTasksPage').then((m) => ({ default: m.WeeklyTasksPage })));
const MonthlyGoalsPage = lazy(() => import('@/pages/MonthlyGoalsPage').then((m) => ({ default: m.MonthlyGoalsPage })));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage })));
const FriendsPage = lazy(() => import('@/pages/FriendsPage').then((m) => ({ default: m.FriendsPage })));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const ChallengeDetailPage = lazy(() =>
  import('@/pages/ChallengeDetailPage').then((m) => ({ default: m.ChallengeDetailPage }))
);
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const HistoryMonthPage = lazy(() =>
  import('@/pages/HistoryMonthPage').then((m) => ({ default: m.HistoryMonthPage }))
);
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const LeaderboardPage = lazy(() =>
  import('@/pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage }))
);
const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const CreateChallengePage = lazy(() =>
  import('@/pages/CreateChallengePage').then((m) => ({ default: m.CreateChallengePage }))
);
const FriendProfilePage = lazy(() =>
  import('@/pages/FriendProfilePage').then((m) => ({ default: m.FriendProfilePage }))
);
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
    <div className="glass p-8 text-center rounded-2xl">
      <div
        className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
        style={{ borderColor: 'var(--glass-border)', borderTopColor: 'var(--color-primary)' }}
      />
      <p className="text-fluid-sm" style={{ color: 'var(--color-text-muted)' }}>
        Loading Veyra...
      </p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <Suspense fallback={<Loading />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.ABOUT,
    element: (
      <Suspense fallback={<Loading />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<Loading />}>
          <LoginPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<Loading />}>
          <RegisterPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<Loading />}>
          <ForgotPasswordPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DAILY_TASKS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <DailyTasksPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.WEEKLY_TASKS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <WeeklyTasksPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MONTHLY_GOALS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <MonthlyGoalsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ACHIEVEMENTS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <AchievementsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FRIENDS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <FriendsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FRIEND_PROFILE,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <FriendProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CHALLENGES,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <ChallengesPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CREATE_CHALLENGE,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <CreateChallengePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CHALLENGE_DETAIL,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <ChallengeDetailPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ANALYTICS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <AnalyticsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.HISTORY,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <HistoryPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.HISTORY_MONTH,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <HistoryMonthPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CALENDAR,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <CalendarPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LEADERBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <LeaderboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.NOTIFICATIONS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <NotificationsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <SettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<Loading />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
