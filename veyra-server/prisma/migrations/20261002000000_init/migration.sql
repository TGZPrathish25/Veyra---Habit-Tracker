-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "friend_visibility_level" INTEGER NOT NULL DEFAULT 2,
    "leaderboard_opt_in" BOOLEAN NOT NULL DEFAULT true,
    "deadline_alert_prefs" JSONB,
    "notification_prefs" JSONB,
    "challenge_prefs" JSONB,
    "week_start_day" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "color" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT true,
    "days_of_week" INTEGER[],
    "due_time" TEXT,
    "day_due_times" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_occurrences" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "task_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "goals" JSONB NOT NULL DEFAULT '[]',
    "reflection" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "goals" JSONB NOT NULL DEFAULT '[]',
    "reflection" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gamification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_requests" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "privacy_level" TEXT NOT NULL DEFAULT 'basic',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "target_value" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "tasks_completed" INTEGER NOT NULL,
    "total_tasks" INTEGER NOT NULL,
    "completion_rate" DOUBLE PRECISION NOT NULL,
    "xp_earned" INTEGER NOT NULL,
    "streak_days" INTEGER NOT NULL,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_occurrences_task_id_date_key" ON "task_occurrences"("task_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_plans_user_id_week_start_key" ON "weekly_plans"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_plans_user_id_year_month_key" ON "monthly_plans"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "gamification_user_id_key" ON "gamification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_type_key" ON "streaks"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_requests_sender_id_receiver_id_key" ON "friend_requests"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_user_id_friend_id_key" ON "friendships"("user_id", "friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challenge_id_user_id_key" ON "challenge_participants"("challenge_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_snapshots_user_id_year_month_key" ON "monthly_snapshots"("user_id", "year", "month");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_snapshots" ADD CONSTRAINT "monthly_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

