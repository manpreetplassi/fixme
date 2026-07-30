import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineItem } from '../today/entities/routine-item.entity';
import { CareArea } from './entities/care-area.entity';
import { CareTask } from './entities/care-task.entity';
import { SelfCareController } from './self-care.controller';
import { SelfCareService } from './self-care.service';

@Module({
  imports: [TypeOrmModule.forFeature([CareArea, CareTask, RoutineItem])],
  controllers: [SelfCareController],
  providers: [SelfCareService],
})
export class SelfCareModule {}
