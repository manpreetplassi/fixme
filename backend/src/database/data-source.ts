import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { DailyLog } from '../daily-logs/entities/daily-log.entity';
import { DailyTask } from '../daily-tasks/entities/daily-task.entity';
import { HobbyLog } from '../hobbies/entities/hobby-log.entity';
import { Hobby } from '../hobbies/entities/hobby.entity';
import { LearningLog } from '../learning-logs/entities/learning-log.entity';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { Reel } from '../reels-vault/entities/reel.entity';
import { Solution } from '../solutions-bank/entities/solution.entity';
import { Streak } from '../streaks/entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
import { RoutineItem } from '../today/entities/routine-item.entity';
import { ScreenCheckIn } from '../today/entities/screen-check-in.entity';
import { User } from '../users/entities/user.entity';
import { getDatabaseUrlFromEnv } from './database-url';
import { migrations } from './migrations';

loadEnv();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: getDatabaseUrlFromEnv(),
  entities: [User, DailyTask, DailyLog, Hobby, HobbyLog, LearningLog, Reflection, Reel, MoneyEntry, Solution, Streak, RoutineItem, RoutineCompletion, ScreenCheckIn],
  migrations,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});
