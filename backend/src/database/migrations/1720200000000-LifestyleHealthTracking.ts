import { MigrationInterface, QueryRunner } from 'typeorm';

export class LifestyleHealthTracking1720200000000 implements MigrationInterface {
  name = 'LifestyleHealthTracking1720200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lifestyle_days" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "log_date" date NOT NULL,
        "wake_time" character varying,
        "sleep_time" character varying,
        "sleep_hours" numeric(4,1),
        "sleep_quality" character varying,
        "mood" character varying,
        "morning_energy" character varying,
        "night_energy" character varying,
        "screen_shutdown_time" character varying,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_lifestyle_days_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meal_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_date" date NOT NULL,
        "meal_type" character varying NOT NULL,
        "meal_time" character varying,
        "meal_name" character varying,
        "food_items" jsonb NOT NULL DEFAULT '[]',
        "homemade" boolean NOT NULL DEFAULT true,
        "outside_food" boolean NOT NULL DEFAULT false,
        "leftover_from_dinner" boolean NOT NULL DEFAULT false,
        "restaurant" character varying,
        "sabzi_name" character varying,
        "roti_count" integer,
        "rice" boolean NOT NULL DEFAULT false,
        "dal" boolean NOT NULL DEFAULT false,
        "salad" boolean NOT NULL DEFAULT false,
        "curd" boolean NOT NULL DEFAULT false,
        "fruits" boolean NOT NULL DEFAULT false,
        "tea" boolean NOT NULL DEFAULT false,
        "coffee" boolean NOT NULL DEFAULT false,
        "cost" numeric(10,2),
        "outside_reason" character varying,
        "quantity" character varying,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_meal_entries_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meal_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "meal_type" character varying NOT NULL,
        "food_items" jsonb NOT NULL DEFAULT '[]',
        "homemade" boolean NOT NULL DEFAULT true,
        "sabzi_name" character varying,
        "roti_count" integer,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_meal_templates_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lifestyle_activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "activity_date" date NOT NULL,
        "activity_type" character varying NOT NULL,
        "name" character varying,
        "start_time" character varying,
        "end_time" character varying,
        "duration_minutes" integer NOT NULL DEFAULT 0,
        "project_name" character varying,
        "calories" integer,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_lifestyle_activities_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_lifestyle_days_user_date') THEN
          ALTER TABLE "lifestyle_days" ADD CONSTRAINT "UQ_lifestyle_days_user_date" UNIQUE ("user_id", "log_date");
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_lifestyle_days_user_id') THEN
          ALTER TABLE "lifestyle_days" ADD CONSTRAINT "FK_lifestyle_days_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_meal_entries_user_id') THEN
          ALTER TABLE "meal_entries" ADD CONSTRAINT "FK_meal_entries_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_meal_templates_user_id') THEN
          ALTER TABLE "meal_templates" ADD CONSTRAINT "FK_meal_templates_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_lifestyle_activities_user_id') THEN
          ALTER TABLE "lifestyle_activities" ADD CONSTRAINT "FK_lifestyle_activities_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "lifestyle_activities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_templates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lifestyle_days"`);
  }
}
