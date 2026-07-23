import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddictionLabel1720600000000 implements MigrationInterface {
  name = 'AddAddictionLabel1720600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "addiction_label" character varying NOT NULL DEFAULT 'addiction'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "addiction_label"`);
  }
}
