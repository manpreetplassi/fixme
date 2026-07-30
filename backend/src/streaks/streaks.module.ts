import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Streak } from './entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Streak, RoutineCompletion])],
  providers: [StreaksService],
  controllers: [StreaksController],
  exports: [StreaksService],
})
export class StreaksModule {}
