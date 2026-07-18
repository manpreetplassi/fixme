import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1719600000000 implements MigrationInterface {
  name = 'InitialSchema1719600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "name" character varying NOT NULL,
        "bio" text,
        "wake_target" character varying NOT NULL DEFAULT '06:00',
        "sleep_target" character varying NOT NULL DEFAULT '23:00',
        "exercise_minutes_target" integer NOT NULL DEFAULT 60,
        "daily_zomato_avoidance_savings" numeric(10,2) NOT NULL DEFAULT '400',
        "weekly_reward_threshold" integer NOT NULL DEFAULT 1000,
        "dark_mode" boolean NOT NULL DEFAULT true,
        "notifications_enabled" boolean NOT NULL DEFAULT true,
        "preferred_hobbies" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "daily_tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "day_type" character varying NOT NULL,
        "priority" character varying NOT NULL,
        "points" integer NOT NULL,
        "category" character varying NOT NULL,
        "is_optional" boolean NOT NULL DEFAULT false,
        "is_bonus" boolean NOT NULL DEFAULT false,
        "max_cheats_per_week" integer NOT NULL DEFAULT 1,
        "icon" character varying,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_daily_tasks_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "hobbies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "category" character varying NOT NULL,
        "icon" character varying,
        "is_weekend_only" boolean NOT NULL DEFAULT false,
        "default_points_per_instance" integer NOT NULL DEFAULT 5,
        "suggested_minutes_per_day" integer NOT NULL DEFAULT 15,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hobbies_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "daily_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "log_date" date NOT NULL,
        "status" character varying NOT NULL DEFAULT 'not_started',
        "points_earned" integer NOT NULL DEFAULT 0,
        "duration_minutes" integer,
        "rating" integer,
        "notes" text,
        "money_saved" numeric(10,2) NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        "task_id" uuid,
        CONSTRAINT "PK_daily_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "hobby_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "log_date" date NOT NULL,
        "duration_minutes" integer NOT NULL DEFAULT 0,
        "points_earned" integer NOT NULL DEFAULT 0,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        "hobby_id" uuid,
        CONSTRAINT "PK_hobby_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "learning_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "log_date" date NOT NULL,
        "title" character varying NOT NULL,
        "key_notes" text NOT NULL,
        "detailed_description" text,
        "code_link" character varying,
        "tweeted_to_twitter" boolean NOT NULL DEFAULT false,
        "posted_to_linkedin" boolean NOT NULL DEFAULT false,
        "tweet_url" character varying,
        "linkedin_url" character varying,
        "tags" character varying,
        "time_spent_minutes" integer,
        "confidence_rating" integer,
        "points_earned" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_learning_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "reflections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reflection_date" date NOT NULL,
        "what_went_well" text,
        "what_didnt_work" text,
        "primary_blocker" character varying,
        "blocker_details" text,
        "solution_to_try" text,
        "mood" character varying,
        "energy_level" integer,
        "masturbation_happened" boolean NOT NULL DEFAULT false,
        "masturbation_trigger_log" text,
        "daily_score" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_reflections_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "reels_vault" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reel_url" character varying NOT NULL,
        "thumbnail_url" character varying,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "category" character varying,
        "ai_analysis" jsonb,
        "user_notes" text,
        "linked_triggers" jsonb NOT NULL DEFAULT '[]',
        "use_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_reels_vault_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "money_tracker" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amount" numeric(10,2) NOT NULL,
        "log_date" date NOT NULL,
        "reason" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_money_tracker_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "solutions_bank" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "blocker" character varying NOT NULL,
        "trigger" character varying NOT NULL,
        "solution" text NOT NULL,
        "action_items" jsonb NOT NULL DEFAULT '[]',
        "related_reels" jsonb NOT NULL DEFAULT '[]',
        "priority" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_solutions_bank_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "streaks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "habit_name" character varying NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "current_count" integer NOT NULL DEFAULT 0,
        "best_count" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "icon" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_streaks_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`ALTER TABLE "daily_logs" ADD CONSTRAINT "FK_daily_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "daily_logs" ADD CONSTRAINT "FK_daily_logs_task_id" FOREIGN KEY ("task_id") REFERENCES "daily_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "hobby_logs" ADD CONSTRAINT "FK_hobby_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "hobby_logs" ADD CONSTRAINT "FK_hobby_logs_hobby_id" FOREIGN KEY ("hobby_id") REFERENCES "hobbies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "learning_logs" ADD CONSTRAINT "FK_learning_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "reflections" ADD CONSTRAINT "FK_reflections_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "reels_vault" ADD CONSTRAINT "FK_reels_vault_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD CONSTRAINT "FK_money_tracker_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "streaks" ADD CONSTRAINT "FK_streaks_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "streaks" DROP CONSTRAINT "FK_streaks_user_id"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP CONSTRAINT "FK_money_tracker_user_id"`);
    await queryRunner.query(`ALTER TABLE "reels_vault" DROP CONSTRAINT "FK_reels_vault_user_id"`);
    await queryRunner.query(`ALTER TABLE "reflections" DROP CONSTRAINT "FK_reflections_user_id"`);
    await queryRunner.query(`ALTER TABLE "learning_logs" DROP CONSTRAINT "FK_learning_logs_user_id"`);
    await queryRunner.query(`ALTER TABLE "hobby_logs" DROP CONSTRAINT "FK_hobby_logs_hobby_id"`);
    await queryRunner.query(`ALTER TABLE "hobby_logs" DROP CONSTRAINT "FK_hobby_logs_user_id"`);
    await queryRunner.query(`ALTER TABLE "daily_logs" DROP CONSTRAINT "FK_daily_logs_task_id"`);
    await queryRunner.query(`ALTER TABLE "daily_logs" DROP CONSTRAINT "FK_daily_logs_user_id"`);
    await queryRunner.query(`DROP TABLE "streaks"`);
    await queryRunner.query(`DROP TABLE "solutions_bank"`);
    await queryRunner.query(`DROP TABLE "money_tracker"`);
    await queryRunner.query(`DROP TABLE "reels_vault"`);
    await queryRunner.query(`DROP TABLE "reflections"`);
    await queryRunner.query(`DROP TABLE "learning_logs"`);
    await queryRunner.query(`DROP TABLE "hobby_logs"`);
    await queryRunner.query(`DROP TABLE "daily_logs"`);
    await queryRunner.query(`DROP TABLE "hobbies"`);
    await queryRunner.query(`DROP TABLE "daily_tasks"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
