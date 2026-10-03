-- AlterTable
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "due_time" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "day_due_times" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tasks_user_id_is_active_idx" ON "tasks"("user_id", "is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "task_occurrences_user_id_date_idx" ON "task_occurrences"("user_id", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_idx" ON "notifications"("user_id", "read");
