import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateHobbyDto, CreateHobbyLogDto, UpdateHobbyDto, UpdateHobbyLogDto } from './dto/hobby.dto';
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update hobby' })
  update(@Param('id') id: string, @Body() dto: UpdateHobbyDto) {
    return this.hobbiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete hobby' })
  remove(@Param('id') id: string) {
    return this.hobbiesService.remove(id);
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

  @Patch('logs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update hobby log' })
  updateLog(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateHobbyLogDto) {
    return this.hobbiesService.updateLog(id, user.id, dto);
  }

  @Delete('logs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete hobby log' })
  removeLog(@CurrentUser() user: User, @Param('id') id: string) {
    return this.hobbiesService.removeLog(id, user.id);
  }
}
