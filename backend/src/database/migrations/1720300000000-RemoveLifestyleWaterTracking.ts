import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLifestyleWaterTracking1720300000000 implements MigrationInterface {
  name = 'RemoveLifestyleWaterTracking1720300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lifestyle_days" DROP COLUMN IF EXISTS "water_litres"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lifestyle_days" ADD COLUMN IF NOT EXISTS "water_litres" numeric(4,1) NOT NULL DEFAULT '0'`);
  }
}
