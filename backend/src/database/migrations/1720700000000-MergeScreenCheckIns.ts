import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeScreenCheckIns1720700000000 implements MigrationInterface {
  name = 'MergeScreenCheckIns1720700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO screen_check_ins (user_id, check_date, period, watched, content_type, title_note, stopped_watching_at, created_at, updated_at)
      SELECT DISTINCT ON (user_id, check_date)
        user_id, check_date,
        'daily' AS period,
        watched, content_type, title_note, stopped_watching_at, created_at, updated_at
      FROM screen_check_ins
      WHERE period IN ('morning', 'night')
      ORDER BY user_id, check_date, CASE WHEN period = 'night' THEN 0 ELSE 1 END
      ON CONFLICT (user_id, check_date, period) DO NOTHING
    `);

    await queryRunner.query(`DELETE FROM screen_check_ins WHERE period IN ('morning', 'night')`);

    await queryRunner.query(`
      INSERT INTO routine_completions (user_id, completion_date, system_key, is_done, status, points_earned, completed_at, created_at)
      SELECT DISTINCT ON (user_id, completion_date)
        user_id, completion_date, 'screen_daily', is_done, status, points_earned, completed_at, created_at
      FROM routine_completions
      WHERE system_key IN ('screen_morning', 'screen_night')
      ORDER BY user_id, completion_date, CASE WHEN system_key = 'screen_night' THEN 0 ELSE 1 END
      ON CONFLICT DO NOTHING
    `);

    await queryRunner.query(`DELETE FROM routine_completions WHERE system_key IN ('screen_morning', 'screen_night')`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Not reversible
  }
}
