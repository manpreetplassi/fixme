import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyRoutineMoneyAndHobbies1720400000000 implements MigrationInterface {
  name = 'UnifyRoutineMoneyAndHobbies1720400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "points" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "legacy_task_id" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "icon" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "plan_id" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "linked_money_entry_id" uuid`);

    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'not_started'`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "points_earned" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "duration_minutes" integer`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "rating" integer`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "legacy_log_id" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "linked_money_entry_id" uuid`);

    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "type" character varying NOT NULL DEFAULT 'saved'`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "category" character varying NOT NULL DEFAULT 'Other'`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "name" character varying`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "parent_entry_id" uuid`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "is_recurring" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "recurrence_rule" character varying`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "needs_price" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "source_type" character varying`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "source_id" uuid`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "plan_id" character varying`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ALTER COLUMN "amount" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD CONSTRAINT "FK_money_tracker_parent_id" FOREIGN KEY ("parent_entry_id") REFERENCES "money_tracker"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "money_budgets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "category" character varying NOT NULL,
        "monthly_limit" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_money_budgets_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_money_budgets_user_id') THEN
          ALTER TABLE "money_budgets" ADD CONSTRAINT "FK_money_budgets_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_money_budgets_user_category') THEN
          ALTER TABLE "money_budgets" ADD CONSTRAINT "UQ_money_budgets_user_category" UNIQUE ("user_id", "category");
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`ALTER TABLE "meal_entries" ADD COLUMN IF NOT EXISTS "linked_money_entry_id" uuid`);
    await queryRunner.query(`ALTER TABLE "lifestyle_activities" ADD COLUMN IF NOT EXISTS "source_hobby_log_id" uuid`);
    await queryRunner.query(`ALTER TABLE "lifestyle_activities" ADD COLUMN IF NOT EXISTS "linked_money_entry_id" uuid`);

    await queryRunner.query(`
      INSERT INTO "routine_items" ("user_id", "title", "category", "priority", "repeat_rule", "source", "display_order", "points", "legacy_task_id", "icon", "is_active", "created_at", "updated_at")
      SELECT
        u."id",
        t."name",
        t."category",
        CASE WHEN t."priority" IN ('critical', 'high') THEN 'urgent' WHEN t."priority" = 'low' THEN 'low' ELSE 'important' END,
        CASE WHEN t."day_type" = 'weekday' THEN 'weekdays' ELSE 'daily' END,
        'legacy_task',
        t."display_order",
        t."points",
        t."id"::text,
        t."icon",
        t."is_enabled",
        t."created_at",
        now()
      FROM "daily_tasks" t
      CROSS JOIN "users" u
      WHERE NOT EXISTS (
        SELECT 1 FROM "routine_items" ri
        WHERE ri."user_id" = u."id" AND ri."legacy_task_id" = t."id"::text
      )
    `);

    await queryRunner.query(`
      INSERT INTO "routine_completions" ("user_id", "routine_item_id", "completion_date", "is_done", "completed_at", "note", "status", "points_earned", "duration_minutes", "rating", "legacy_log_id", "created_at")
      SELECT
        dl."user_id",
        ri."id",
        dl."log_date",
        dl."status" = 'completed',
        CASE WHEN dl."status" = 'completed' THEN dl."created_at" ELSE NULL END,
        dl."notes",
        dl."status",
        dl."points_earned",
        dl."duration_minutes",
        dl."rating",
        dl."id"::text,
        dl."created_at"
      FROM "daily_logs" dl
      JOIN "routine_items" ri ON ri."user_id" = dl."user_id" AND ri."legacy_task_id" = dl."task_id"::text
      WHERE NOT EXISTS (
        SELECT 1 FROM "routine_completions" rc
        WHERE rc."user_id" = dl."user_id" AND rc."legacy_log_id" = dl."id"::text
      )
    `);

    await queryRunner.query(`
      INSERT INTO "money_tracker" ("user_id", "amount", "log_date", "reason", "type", "category", "name", "source_type", "source_id", "created_at")
      SELECT
        dl."user_id",
        dl."money_saved",
        dl."log_date",
        COALESCE(dl."notes", dt."name"),
        'saved',
        COALESCE(dt."category", 'Savings'),
        dt."name",
        'routine_completion',
        rc."id",
        dl."created_at"
      FROM "daily_logs" dl
      JOIN "daily_tasks" dt ON dt."id" = dl."task_id"
      JOIN "routine_completions" rc ON rc."legacy_log_id" = dl."id"::text
      WHERE dl."money_saved" IS NOT NULL
        AND dl."money_saved" > 0
        AND NOT EXISTS (
          SELECT 1 FROM "money_tracker" mt
          WHERE mt."source_type" = 'routine_completion' AND mt."source_id" = rc."id"
        )
    `);

    await queryRunner.query(`
      UPDATE "routine_completions" rc
      SET "linked_money_entry_id" = mt."id"
      FROM "money_tracker" mt
      WHERE mt."source_type" = 'routine_completion'
        AND mt."source_id" = rc."id"
        AND rc."linked_money_entry_id" IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO "lifestyle_activities" ("user_id", "activity_date", "activity_type", "name", "duration_minutes", "notes", "source_hobby_log_id", "created_at", "updated_at")
      SELECT
        hl."user_id",
        hl."log_date",
        'hobby',
        h."name",
        hl."duration_minutes",
        hl."notes",
        hl."id",
        hl."created_at",
        now()
      FROM "hobby_logs" hl
      JOIN "hobbies" h ON h."id" = hl."hobby_id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "lifestyle_activities" la
        WHERE la."source_hobby_log_id" = hl."id"
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "lifestyle_activities" WHERE "source_hobby_log_id" IS NOT NULL`);
    await queryRunner.query(`DELETE FROM "money_tracker" WHERE "source_type" IN ('routine_completion', 'meal_entry', 'lifestyle_activity')`);
    await queryRunner.query(`DELETE FROM "routine_completions" WHERE "legacy_log_id" IS NOT NULL`);
    await queryRunner.query(`DELETE FROM "routine_items" WHERE "source" = 'legacy_task'`);
    await queryRunner.query(`ALTER TABLE "lifestyle_activities" DROP COLUMN IF EXISTS "linked_money_entry_id"`);
    await queryRunner.query(`ALTER TABLE "lifestyle_activities" DROP COLUMN IF EXISTS "source_hobby_log_id"`);
    await queryRunner.query(`ALTER TABLE "meal_entries" DROP COLUMN IF EXISTS "linked_money_entry_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "money_budgets"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP CONSTRAINT IF EXISTS "FK_money_tracker_parent_id"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "plan_id"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "source_id"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "source_type"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "needs_price"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "recurrence_rule"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "is_recurring"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "parent_entry_id"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "name"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "category"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "type"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "linked_money_entry_id"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "legacy_log_id"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "rating"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "duration_minutes"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "points_earned"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "linked_money_entry_id"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "plan_id"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "icon"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "legacy_task_id"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "points"`);
  }
}
