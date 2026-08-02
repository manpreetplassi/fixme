import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { AiActionLog } from '../chat/entities/ai-action-log.entity';
import { LearningLog } from '../learning-logs/entities/learning-log.entity';
import { LifestyleActivity } from '../lifestyle/entities/lifestyle-activity.entity';
import { LifestyleDay } from '../lifestyle/entities/lifestyle-day.entity';
import { MealEntry } from '../lifestyle/entities/meal-entry.entity';
import { MealTemplate } from '../lifestyle/entities/meal-template.entity';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { Reel } from '../reels-vault/entities/reel.entity';
import { Solution } from '../solutions-bank/entities/solution.entity';
import { Streak } from '../streaks/entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
import { RoutineItem } from '../today/entities/routine-item.entity';
import { ScreenCheckIn } from '../today/entities/screen-check-in.entity';
import { User } from '../users/entities/user.entity';
import { CareArea } from '../self-care/entities/care-area.entity';
import { CareTask } from '../self-care/entities/care-task.entity';
import { getDatabaseUrlFromEnv } from './database-url';
import { migrations } from './migrations';

loadEnv();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: getDatabaseUrlFromEnv(),
  entities: [User, AiActionLog, LearningLog, Reflection, Reel, MoneyEntry, Solution, Streak, RoutineItem, RoutineCompletion, ScreenCheckIn, LifestyleDay, MealEntry, MealTemplate, LifestyleActivity, CareArea, CareTask],
  migrations,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});
