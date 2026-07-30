import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillHobbyLifestyleActivitiesDrift1721000000000 implements MigrationInterface {
  name = 'BackfillHobbyLifestyleActivitiesDrift1721000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "lifestyle_activities" (
        "user_id",
        "activity_date",
        "activity_type",
        "name",
        "duration_minutes",
        "notes",
        "source_hobby_log_id",
        "created_at",
        "updated_at"
      )
      SELECT
        hl."user_id",
        hl."log_date",
        'hobby',
        h."name",
        COALESCE(hl."duration_minutes", 0),
        hl."notes",
        hl."id",
        hl."created_at",
        now()
      FROM "hobby_logs" hl
      JOIN "hobbies" h ON h."id" = hl."hobby_id"
      WHERE NOT EXISTS (
        SELECT 1
        FROM "lifestyle_activities" la
        WHERE la."source_hobby_log_id" = hl."id"
      )
    `);
  }

  public async down(): Promise<void> {
    // Data-preserving down migration: migrated hobby activity rows are left intact.
  }
}
