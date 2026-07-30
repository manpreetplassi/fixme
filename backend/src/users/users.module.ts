import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningLog } from '../learning-logs/entities/learning-log.entity';
import { LifestyleActivity } from '../lifestyle/entities/lifestyle-activity.entity';
import { MealEntry } from '../lifestyle/entities/meal-entry.entity';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { CareArea } from '../self-care/entities/care-area.entity';
import { CareTask } from '../self-care/entities/care-task.entity';
import { Streak } from '../streaks/entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
import { RoutineItem } from '../today/entities/routine-item.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      RoutineCompletion,
      RoutineItem,
      MoneyEntry,
      LearningLog,
      Reflection,
      LifestyleActivity,
      MealEntry,
      Streak,
      CareArea,
      CareTask,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
