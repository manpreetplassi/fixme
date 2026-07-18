import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { DailyTasksModule } from './daily-tasks/daily-tasks.module';
import { GeminiModule } from './gemini/gemini.module';
import { HobbiesModule } from './hobbies/hobbies.module';
import { LearningLogsModule } from './learning-logs/learning-logs.module';
import { MoneyTrackerModule } from './money-tracker/money-tracker.module';
import { ReflectionsModule } from './reflections/reflections.module';
import { ReelsVaultModule } from './reels-vault/reels-vault.module';
import { SolutionsBankModule } from './solutions-bank/solutions-bank.module';
import { StreaksModule } from './streaks/streaks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: config.get<string>('DB_MIGRATIONS_RUN', 'false') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    DailyTasksModule,
    DailyLogsModule,
    StreaksModule,
    HobbiesModule,
    LearningLogsModule,
    ReflectionsModule,
    ReelsVaultModule,
    MoneyTrackerModule,
    SolutionsBankModule,
    AnalyticsModule,
    GeminiModule,
  ],
})
export class AppModule {}
