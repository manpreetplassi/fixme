import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillUnifiedRoutineMoneyAndHobbiesDrift1720500000000 implements MigrationInterface {
  name = 'BackfillUnifiedRoutineMoneyAndHobbiesDrift1720500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(): Promise<void> {
    // Intentionally no-op: the migration only catches legacy drift in unified tables.
  }
}
