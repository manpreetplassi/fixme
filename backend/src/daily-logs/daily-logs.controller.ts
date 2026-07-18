import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateDailyLogDto, UpdateDailyLogDto } from './dto/daily-log.dto';
import { DailyLogsService } from './daily-logs.service';

@ApiTags('daily-logs')
@UseGuards(JwtAuthGuard)
@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly service: DailyLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create daily task log entry' })
  create(@CurrentUser() user: User, @Body() dto: CreateDailyLogDto) {
    return this.service.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get daily logs, optionally filtered by date' })
  findAll(@CurrentUser() user: User, @Query('date') date?: string) {
    return this.service.findAll(user.id, date);
  }

  @Get('score/today')
  @ApiOperation({ summary: "Get today's score summary" })
  getTodayScore(@CurrentUser() user: User, @Query('date') date?: string) {
    return this.service.getTodayScore(user.id, date);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update log entry' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateDailyLogDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete log entry' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }
}
