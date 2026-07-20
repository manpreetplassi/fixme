import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateRoutineItemDto, ScreenCheckInDto, SetRoutineDoneDto, UpdateRoutineItemDto } from './dto/today.dto';
import { TodayService } from './today.service';

@ApiTags('today')
@UseGuards(JwtAuthGuard)
@Controller('today')
export class TodayController {
  constructor(private readonly service: TodayService) {}

  @Get()
  @ApiOperation({ summary: 'Get unified Today routine' })
  getToday(@CurrentUser() user: User, @Query('date') date?: string) {
    return this.service.getToday(user, date);
  }

  @Post('items')
  @ApiOperation({ summary: 'Create routine item' })
  createItem(@CurrentUser() user: User, @Body() dto: CreateRoutineItemDto) {
    return this.service.createItem(user, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update routine item' })
  updateItem(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateRoutineItemDto) {
    return this.service.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Disable routine item' })
  removeItem(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.removeItem(user.id, id);
  }

  @Post('items/:id/done')
  @ApiOperation({ summary: 'Mark routine item done or not done for a date' })
  setDone(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: SetRoutineDoneDto) {
    return this.service.setDone(user, id, dto);
  }

  @Post('screen-checkins')
  @ApiOperation({ summary: 'Create or update morning/night screen check-in' })
  checkIn(@CurrentUser() user: User, @Body() dto: ScreenCheckInDto) {
    return this.service.checkIn(user, dto);
  }

  @Get('screen-checkins/summary')
  @ApiOperation({ summary: 'Get 7-day screen check-in summary' })
  screenSummary(@CurrentUser() user: User, @Query('date') date?: string) {
    return this.service.getScreenSummary(user.id, date);
  }

  @Post('reminders/digest')
  @ApiOperation({ summary: 'Send optional overdue routine reminder digest' })
  sendReminderDigest(@CurrentUser() user: User, @Query('date') date?: string) {
    return this.service.sendReminderDigest(user, date);
  }
}
