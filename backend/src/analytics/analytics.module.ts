import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { Streak } from '../streaks/entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineCompletion, Reflection, MoneyEntry, Streak])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
