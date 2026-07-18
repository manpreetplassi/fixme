import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateReflectionDto } from './dto/reflection.dto';
import { ReflectionsService } from './reflections.service';

@ApiTags('reflections')
@UseGuards(JwtAuthGuard)
@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly service: ReflectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create reflection for today' })
  create(@CurrentUser() user: User, @Body() dto: CreateReflectionDto) {
    return this.service.create(user, dto);
  }

  @Get('week')
  findWeek(@CurrentUser() user: User) {
    return this.service.findWeek(user.id);
  }

  @Get('stats/blockers')
  blockerStats(@CurrentUser() user: User, @Query('period') _period?: string) {
    return this.service.blockerStats(user.id);
  }

  @Get(':date')
  findByDate(@CurrentUser() user: User, @Param('date') date: string) {
    return this.service.findByDate(user.id, date);
  }
}
