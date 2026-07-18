import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyLogsModule } from '../daily-logs/daily-logs.module';
import { Reflection } from './entities/reflection.entity';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reflection]), DailyLogsModule],
  controllers: [ReflectionsController],
  providers: [ReflectionsService],
  exports: [ReflectionsService],
})
export class ReflectionsModule {}
