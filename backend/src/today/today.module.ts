import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineCompletion } from './entities/routine-completion.entity';
import { RoutineItem } from './entities/routine-item.entity';
import { ScreenCheckIn } from './entities/screen-check-in.entity';
import { TodayController } from './today.controller';
import { TodayRemindersService } from './today-reminders.service';
import { TodayService } from './today.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineItem, RoutineCompletion, ScreenCheckIn])],
  controllers: [TodayController],
  providers: [TodayService, TodayRemindersService],
  exports: [TodayService],
})
export class TodayModule {}
