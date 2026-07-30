import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoutineStatusTimingTags1720900000000 implements MigrationInterface {
  name = 'RoutineStatusTimingTags1720900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "scheduled_date" date`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "item_type" character varying NOT NULL DEFAULT 'simple'`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "target_value" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "target_unit" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "tolerance_value" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "parent_tag" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "sub_tag" character varying`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "time_tracking_enabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "reminder_trigger_type" character varying NOT NULL DEFAULT 'time'`);
    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "reminder_trigger_item_id" uuid`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "actual_value" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "score" integer`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "timer_started_at" timestamp`);

    await queryRunner.query(`UPDATE "routine_items" SET "parent_tag" = COALESCE("parent_tag", "category")`);
    await queryRunner.query(`UPDATE "routine_items" SET "scheduled_date" = COALESCE("scheduled_date", "created_at"::date) WHERE "repeat_rule" = 'once'`);
    await queryRunner.query(`
      UPDATE "routine_completions"
      SET "score" = CASE
        WHEN "status" IN ('done', 'completed') THEN 10
        WHEN "status" = 'skipped' THEN NULL
        WHEN "status" = 'failed' THEN 0
        ELSE NULL
      END
      WHERE "score" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "timer_started_at"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "score"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "actual_value"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "reminder_trigger_item_id"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "reminder_trigger_type"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "time_tracking_enabled"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "sub_tag"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "parent_tag"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "tolerance_value"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "target_unit"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "target_value"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "item_type"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "scheduled_date"`);
  }
}
