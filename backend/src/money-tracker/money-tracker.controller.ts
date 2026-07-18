import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateMoneyEntryDto, UpdateMoneyEntryDto } from './dto/money-entry.dto';
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

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id);
  }

  @Get('summary')
  summary(@CurrentUser() user: User, @Query('period') _period?: string) {
    return this.service.summary(user.id);
  }

  @Get('stats')
  stats(@CurrentUser() user: User) {
    return this.service.stats(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateMoneyEntryDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }
}
