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
import { User } from '../users/entities/user.entity';

loadEnv();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, DailyTask, DailyLog, Hobby, HobbyLog, LearningLog, Reflection, Reel, MoneyEntry, Solution, Streak],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});
