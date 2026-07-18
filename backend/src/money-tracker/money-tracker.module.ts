import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyTrackerController } from './money-tracker.controller';
import { MoneyTrackerService } from './money-tracker.service';
import { MoneyEntry } from './entities/money-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MoneyEntry])],
  controllers: [MoneyTrackerController],
  providers: [MoneyTrackerService],
})
export class MoneyTrackerModule {}
