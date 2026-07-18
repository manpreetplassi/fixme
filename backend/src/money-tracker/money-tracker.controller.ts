import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateMoneyEntryDto } from './dto/money-entry.dto';
import { MoneyTrackerService } from './money-tracker.service';

@ApiTags('money-tracker')
@UseGuards(JwtAuthGuard)
@Controller('money-tracker')
export class MoneyTrackerController {
  constructor(private readonly service: MoneyTrackerService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateMoneyEntryDto) {
    return this.service.create(user, dto);
  }

  @Get('summary')
  summary(@CurrentUser() user: User, @Query('period') _period?: string) {
    return this.service.summary(user.id);
  }

  @Get('stats')
  stats(@CurrentUser() user: User) {
    return this.service.stats(user.id);
  }
}
