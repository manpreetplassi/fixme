import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('weekly')
  weekly(@CurrentUser() user: User) {
    return this.service.weekly(user.id);
  }

  @Get('monthly')
  monthly(@CurrentUser() user: User) {
    return this.service.monthly(user.id);
  }

  @Get('blockers')
  blockers(@CurrentUser() user: User) {
    return this.service.blockers(user.id);
  }

  @Get('habits')
  habits(@CurrentUser() user: User) {
    return this.service.habits(user.id);
  }
}
