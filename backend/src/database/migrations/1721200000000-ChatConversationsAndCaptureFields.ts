import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatConversationsAndCaptureFields1721200000000 implements MigrationInterface {
  name = 'ChatConversationsAndCaptureFields1721200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "conversation_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations_conversation_id" PRIMARY KEY ("conversation_id")
      )
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_conversations_user_id') THEN
          ALTER TABLE "conversations"
          ADD CONSTRAINT "FK_conversations_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_conversations_user_updated" ON "conversations" ("user_id", "updated_at")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "message_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "role" character varying NOT NULL,
        "content" text NOT NULL,
        "is_streamed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages_message_id" PRIMARY KEY ("message_id")
      )
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_messages_conversation_id') THEN
          ALTER TABLE "messages"
          ADD CONSTRAINT "FK_messages_conversation_id"
          FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_messages_conversation_created" ON "messages" ("conversation_id", "created_at")`);

    await queryRunner.query(`ALTER TABLE "routine_items" ADD COLUMN IF NOT EXISTS "consequence_note" text`);
    await queryRunner.query(`ALTER TABLE "routine_completions" ADD COLUMN IF NOT EXISTS "blocker_reason" text`);
    await queryRunner.query(`ALTER TABLE "meal_entries" ADD COLUMN IF NOT EXISTS "needs_price" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`UPDATE "meal_entries" SET "needs_price" = true WHERE "cost" IS NULL`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "linked_source_type" character varying`);
    await queryRunner.query(`ALTER TABLE "money_tracker" ADD COLUMN IF NOT EXISTS "linked_source_id" uuid`);
    await queryRunner.query(`UPDATE "money_tracker" SET "linked_source_type" = "source_type" WHERE "linked_source_type" IS NULL AND "source_type" IS NOT NULL`);
    await queryRunner.query(`UPDATE "money_tracker" SET "linked_source_id" = "source_id" WHERE "linked_source_id" IS NULL AND "source_id" IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "linked_source_id"`);
    await queryRunner.query(`ALTER TABLE "money_tracker" DROP COLUMN IF EXISTS "linked_source_type"`);
    await queryRunner.query(`ALTER TABLE "meal_entries" DROP COLUMN IF EXISTS "needs_price"`);
    await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN IF EXISTS "blocker_reason"`);
    await queryRunner.query(`ALTER TABLE "routine_items" DROP COLUMN IF EXISTS "consequence_note"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_conversation_created"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "FK_messages_conversation_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_user_updated"`);
    await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "FK_conversations_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
  }
}
