/** Seed script — populates the database with demo data for development. */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@veyra.app' },
    update: {},
    create: {
      firebaseUid: 'demo-firebase-uid',
      email: 'demo@veyra.app',
      username: 'demo',
      displayName: 'Demo User',
      timezone: 'America/New_York',
      settings: {
        create: {
          theme: 'dark',
          defaultPrivacyLevel: 'friends',
        },
      },
      gamification: {
        create: {
          totalXp: 1250,
          level: 5,
          tasksCompleted: 47,
        },
      },
    },
  });

  // Create demo tasks
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-morning-routine' },
      update: {},
      create: {
        id: 'task-morning-routine',
        userId: user.id,
        title: 'Morning Routine',
        emoji: '🌅',
        color: '#f59e0b',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        sortOrder: 0,
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-exercise' },
      update: {},
      create: {
        id: 'task-exercise',
        userId: user.id,
        title: 'Exercise',
        emoji: '💪',
        color: '#10b981',
        daysOfWeek: [1, 3, 5],
        sortOrder: 1,
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-reading' },
      update: {},
      create: {
        id: 'task-reading',
        userId: user.id,
        title: 'Read 30 minutes',
        emoji: '📚',
        color: '#8b5cf6',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        sortOrder: 2,
      },
    }),
  ]);

  // Create demo streaks
  await Promise.all([
    prisma.streak.upsert({
      where: { userId_type: { userId: user.id, type: 'daily' } },
      update: {},
      create: { userId: user.id, type: 'daily', current: 7, longest: 14 },
    }),
    prisma.streak.upsert({
      where: { userId_type: { userId: user.id, type: 'weekly' } },
      update: {},
      create: { userId: user.id, type: 'weekly', current: 3, longest: 5 },
    }),
  ]);

  // Create achievement catalogue
  const achievements = [
    { key: 'first_task', title: 'First Step', description: 'Complete your first task', icon: '🎯', xpReward: 50, category: 'tasks' },
    { key: 'week_streak', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 100, category: 'streaks' },
    { key: 'month_streak', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⚡', xpReward: 500, category: 'streaks' },
    { key: 'social_butterfly', title: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', xpReward: 75, category: 'social' },
    { key: 'century', title: 'Century', description: 'Complete 100 tasks', icon: '💯', xpReward: 200, category: 'milestones' },
    { key: 'challenger', title: 'Challenger', description: 'Win your first challenge', icon: '🏆', xpReward: 150, category: 'social' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {},
      create: a,
    });
  }

  // Award first achievement to demo user
  await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId: user.id,
        achievementId: (await prisma.achievement.findUnique({ where: { key: 'first_task' } }))!.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      achievementId: (await prisma.achievement.findUnique({ where: { key: 'first_task' } }))!.id,
    },
  });

  console.log('✅ Seed complete');
  console.log(`   User: ${user.email} (${user.id})`);
  console.log(`   Tasks: ${tasks.length}`);
  console.log(`   Achievements: ${achievements.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
