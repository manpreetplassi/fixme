import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyTrackerModule } from '../money-tracker/money-tracker.module';
import { LifestyleActivity } from './entities/lifestyle-activity.entity';
import { LifestyleDay } from './entities/lifestyle-day.entity';
import { MealEntry } from './entities/meal-entry.entity';
import { MealTemplate } from './entities/meal-template.entity';
import { LifestyleController } from './lifestyle.controller';
import { LifestyleService } from './lifestyle.service';

@Module({
  imports: [TypeOrmModule.forFeature([LifestyleDay, MealEntry, MealTemplate, LifestyleActivity]), MoneyTrackerModule],
  controllers: [LifestyleController],
  providers: [LifestyleService],
  exports: [LifestyleService],
})
export class LifestyleModule {}
