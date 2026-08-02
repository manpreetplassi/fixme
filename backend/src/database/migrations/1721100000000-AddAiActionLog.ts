import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiActionLog1721100000000 implements MigrationInterface {
  name = 'AddAiActionLog1721100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_action_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "action_type" character varying NOT NULL,
        "payload" jsonb NOT NULL,
        "status" character varying NOT NULL DEFAULT 'proposed',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMP,
        CONSTRAINT "PK_ai_action_log_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "ai_action_log"
      ADD CONSTRAINT "FK_ai_action_log_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ai_action_log" DROP CONSTRAINT IF EXISTS "FK_ai_action_log_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_action_log"`);
  }
}
