import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineCompletion } from './entities/routine-completion.entity';
import { RoutineItem } from './entities/routine-item.entity';
import { ScreenCheckIn } from './entities/screen-check-in.entity';
import { TodayController } from './today.controller';
import { TodayRemindersService } from './today-reminders.service';
import { TodayService } from './today.service';
import { User } from '../users/entities/user.entity';
import { StreaksModule } from '../streaks/streaks.module';
import { LearningLog } from '../learning-logs/entities/learning-log.entity';
import { LifestyleActivity } from '../lifestyle/entities/lifestyle-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineItem, RoutineCompletion, ScreenCheckIn, User, LifestyleActivity, LearningLog]), StreaksModule],
  controllers: [TodayController],
  providers: [TodayService, TodayRemindersService],
  exports: [TodayService],
})
export class TodayModule {}
