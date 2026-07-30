import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSelfCare1720800000000 implements MigrationInterface {
  name = 'AddSelfCare1720800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "care_areas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "icon" character varying,
        "color" character varying,
        "description" text,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_care_areas" PRIMARY KEY ("id"),
        CONSTRAINT "FK_care_areas_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "care_tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "care_area_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "notes" text,
        "frequency" character varying NOT NULL DEFAULT 'daily',
        "priority" character varying NOT NULL DEFAULT 'important',
        "is_active" boolean NOT NULL DEFAULT true,
        "routine_item_id" uuid,
        "display_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_care_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_care_tasks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_care_tasks_area" FOREIGN KEY ("care_area_id") REFERENCES "care_areas"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "care_tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "care_areas"`);
  }
}
