import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningLogsController } from './learning-logs.controller';
import { LearningLogsService } from './learning-logs.service';
import { LearningLog } from './entities/learning-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningLog])],
  controllers: [LearningLogsController],
  providers: [LearningLogsService],
  exports: [LearningLogsService],
})
export class LearningLogsModule {}
