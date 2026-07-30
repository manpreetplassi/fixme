import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodayModule } from '../today/today.module';
import { Reflection } from './entities/reflection.entity';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reflection]), TodayModule],
  controllers: [ReflectionsController],
  providers: [ReflectionsService],
  exports: [ReflectionsService],
})
export class ReflectionsModule {}
