import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ActivityDto, MealDto, MealTemplateDto, UpsertLifestyleDayDto } from './dto/lifestyle.dto';
import { LifestyleService } from './lifestyle.service';

@ApiTags('lifestyle')
@UseGuards(JwtAuthGuard)
@Controller('lifestyle')
export class LifestyleController {
  constructor(private readonly service: LifestyleService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get daily lifestyle journal' })
  today(@CurrentUser() user: User, @Query('date') date?: string) {
    return this.service.getToday(user, date);
  }

  @Patch('day')
  @ApiOperation({ summary: 'Update daily health, sleep, mood, water, notes' })
  upsertDay(@CurrentUser() user: User, @Body() dto: UpsertLifestyleDayDto) {
    return this.service.upsertDay(user, dto);
  }

  @Post('meals')
  createMeal(@CurrentUser() user: User, @Body() dto: MealDto) {
    return this.service.createMeal(user, dto);
  }

  @Patch('meals/:id')
  updateMeal(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: Partial<MealDto>) {
    return this.service.updateMeal(user.id, id, dto);
  }

  @Delete('meals/:id')
  removeMeal(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.removeMeal(user.id, id);
  }

  @Get('templates')
  templates(@CurrentUser() user: User) {
    return this.service.templates(user.id);
  }

  @Post('templates')
  createTemplate(@CurrentUser() user: User, @Body() dto: MealTemplateDto) {
    return this.service.createTemplate(user, dto);
  }

  @Post('templates/:id/use')
  useTemplate(@CurrentUser() user: User, @Param('id') id: string, @Query('date') date?: string) {
    return this.service.useTemplate(user, id, date);
  }

  @Post('activities')
  createActivity(@CurrentUser() user: User, @Body() dto: ActivityDto) {
    return this.service.createActivity(user, dto);
  }

  @Patch('activities/:id')
  updateActivity(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: Partial<ActivityDto>) {
    return this.service.updateActivity(user.id, id, dto);
  }

  @Delete('activities/:id')
  removeActivity(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.removeActivity(user.id, id);
  }

  @Get('analytics')
  analytics(@CurrentUser() user: User, @Query('range') range?: 'week' | 'month', @Query('date') date?: string) {
    return this.service.analytics(user.id, range ?? 'week', date);
  }

  @Get('search')
  search(@CurrentUser() user: User, @Query('q') query = '') {
    return this.service.search(user.id, query);
  }
}
