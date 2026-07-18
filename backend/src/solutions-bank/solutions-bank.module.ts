import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solution } from './entities/solution.entity';
import { SolutionsBankController } from './solutions-bank.controller';
import { SolutionsBankService } from './solutions-bank.service';

@Module({
  imports: [TypeOrmModule.forFeature([Solution])],
  controllers: [SolutionsBankController],
  providers: [SolutionsBankService],
  exports: [SolutionsBankService],
})
export class SolutionsBankModule {}
