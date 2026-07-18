import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyLog } from './entities/daily-log.entity';
import { DailyTask } from '../daily-tasks/entities/daily-task.entity';
import { DailyLogsController } from './daily-logs.controller';
import { DailyLogsService } from './daily-logs.service';
import { StreaksModule } from '../streaks/streaks.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyLog, DailyTask]), StreaksModule],
  controllers: [DailyLogsController],
  providers: [DailyLogsService],
  exports: [DailyLogsService],
})
export class DailyLogsModule {}
