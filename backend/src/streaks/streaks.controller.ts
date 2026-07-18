import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { StreaksService } from './streaks.service';

@ApiTags('streaks')
@UseGuards(JwtAuthGuard)
@Controller('streaks')
export class StreaksController {
  constructor(private readonly service: StreaksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all streaks for current user' })
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id);
  }

  @Post('recalculate')
  @ApiOperation({ summary: 'Force recalculate all streaks from history' })
  recalculate(@CurrentUser() user: User) {
    return this.service.refreshUserStreaks(user.id);
  }
}
