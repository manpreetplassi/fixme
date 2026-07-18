import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DailyTasksService } from './daily-tasks.service';
import { CreateDailyTaskDto, UpdateDailyTaskDto } from './dto/daily-task.dto';

@ApiTags('daily-tasks')
@UseGuards(JwtAuthGuard)
@Controller('daily-tasks')
export class DailyTasksController {
  constructor(private readonly service: DailyTasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get task templates, optionally filtered by day_type' })
  @ApiResponse({ status: 200 })
  findAll(@Query('day_type') day_type?: string) {
    return this.service.findAll(day_type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create custom task template' })
  create(@Body() dto: CreateDailyTaskDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Toggle enabled / reorder task' })
  update(@Param('id') id: string, @Body() dto: UpdateDailyTaskDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task template' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
