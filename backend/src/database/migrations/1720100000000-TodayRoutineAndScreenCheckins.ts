import { MigrationInterface, QueryRunner } from 'typeorm';

export class TodayRoutineAndScreenCheckins1720100000000 implements MigrationInterface {
  name = 'TodayRoutineAndScreenCheckins1720100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "routine_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "category" character varying NOT NULL,
        "time_block" character varying,
        "priority" character varying NOT NULL DEFAULT 'important',
        "repeat_rule" character varying NOT NULL DEFAULT 'daily',
        "reminder_enabled" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "source" character varying NOT NULL DEFAULT 'custom',
        "display_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_routine_items_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "routine_completions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "system_key" character varying,
        "completion_date" date NOT NULL,
        "is_done" boolean NOT NULL DEFAULT true,
        "completed_at" TIMESTAMP,
        "note" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        "routine_item_id" uuid,
        CONSTRAINT "PK_routine_completions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "screen_check_ins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "check_date" date NOT NULL,
        "period" character varying NOT NULL,
        "watched" boolean NOT NULL DEFAULT false,
        "content_type" character varying,
        "title_note" text,
        "stopped_watching_at" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_screen_check_ins_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_routine_items_user_id') THEN
          ALTER TABLE "routine_items" ADD CONSTRAINT "FK_routine_items_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_routine_completions_user_id') THEN
          ALTER TABLE "routine_completions" ADD CONSTRAINT "FK_routine_completions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_routine_completions_item_id') THEN
          ALTER TABLE "routine_completions" ADD CONSTRAINT "FK_routine_completions_item_id" FOREIGN KEY ("routine_item_id") REFERENCES "routine_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_screen_check_ins_user_id') THEN
          ALTER TABLE "screen_check_ins" ADD CONSTRAINT "FK_screen_check_ins_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_routine_completion_item_date" ON "routine_completions" ("user_id", "routine_item_id", "completion_date") WHERE "routine_item_id" IS NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_routine_completion_system_date" ON "routine_completions" ("user_id", "system_key", "completion_date") WHERE "system_key" IS NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_screen_check_ins_user_date_period" ON "screen_check_ins" ("user_id", "check_date", "period")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_screen_check_ins_user_date_period"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_routine_completion_system_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_routine_completion_item_date"`);
    await queryRunner.query(`ALTER TABLE "screen_check_ins" DROP CONSTRAINT IF EXISTS "FK_screen_check_ins_user_id"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT IF EXISTS "FK_routine_completions_item_id"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT IF EXISTS "FK_routine_completions_user_id"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP CONSTRAINT IF EXISTS "FK_routine_items_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "screen_check_ins"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "routine_completions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "routine_items"`);
  }
}
