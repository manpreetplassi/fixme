import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateHobbyDto, CreateHobbyLogDto } from './dto/hobby.dto';
import { HobbiesService } from './hobbies.service';

@ApiTags('hobbies')
@Controller('hobbies')
export class HobbiesController {
  constructor(private readonly hobbiesService: HobbiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get hobbies catalog' })
  findAll() {
    return this.hobbiesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create hobby' })
  create(@Body() dto: CreateHobbyDto) {
    return this.hobbiesService.create(dto);
  }

  @Post('log')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Log hobby entry' })
  createLog(@CurrentUser() user: User, @Body() dto: CreateHobbyLogDto) {
    return this.hobbiesService.log(user, dto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get hobby logs' })
  findLogs(@CurrentUser() user: User, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.hobbiesService.findLogs(user.id, startDate, endDate);
  }
}
