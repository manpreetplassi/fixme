import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateLearningLogDto, UpdateLearningLogDto } from './dto/learning-log.dto';
import { LearningLogsService } from './learning-logs.service';

@ApiTags('learning-logs')
@UseGuards(JwtAuthGuard)
@Controller('learning-logs')
export class LearningLogsController {
  constructor(private readonly service: LearningLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create learning log' })
  create(@CurrentUser() user: User, @Body() dto: CreateLearningLogDto) {
    return this.service.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List learning logs' })
  findAll(@CurrentUser() user: User, @Query('skip') skip = '0', @Query('take') take = '10') {
    return this.service.findAll(user.id, +skip, +take);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateLearningLogDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }

  @Post(':id/share')
  share(@CurrentUser() user: User, @Param('id') id: string, @Body('platform') platform: 'twitter' | 'linkedin') {
    return this.service.share(id, user.id, platform);
  }
}
