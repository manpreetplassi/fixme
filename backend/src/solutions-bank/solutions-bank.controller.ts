import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SolutionsBankService } from './solutions-bank.service';

@ApiTags('solutions-bank')
@Controller('solutions-bank')
export class SolutionsBankController {
  constructor(private readonly service: SolutionsBankService) {}

  @Get()
  findAll(@Query('blocker') blocker?: string) {
    return this.service.findAll(blocker);
  }
}
