import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiModule } from '../gemini/gemini.module';
import { ReelsVaultController } from './reels-vault.controller';
import { ReelsVaultService } from './reels-vault.service';
import { Reel } from './entities/reel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reel]), GeminiModule],
  controllers: [ReelsVaultController],
  providers: [ReelsVaultService],
})
export class ReelsVaultModule {}
