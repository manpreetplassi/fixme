import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCareAreaDto, CreateCareTaskDto, UpdateCareAreaDto, UpdateCareTaskDto } from './dto/self-care.dto';
import { SelfCareService } from './self-care.service';

@ApiTags('self-care')
@UseGuards(JwtAuthGuard)
@Controller('self-care')
export class SelfCareController {
  constructor(private readonly service: SelfCareService) {}

  // Areas
  @Get('areas')
  @ApiOperation({ summary: 'List all care areas' })
  getAreas(@CurrentUser() user: User) {
    return this.service.getAreas(user.id);
  }

  @Post('areas')
  @ApiOperation({ summary: 'Create a care area' })
  createArea(@CurrentUser() user: User, @Body() dto: CreateCareAreaDto) {
    return this.service.createArea(user, dto);
  }

  @Patch('areas/:id')
  @ApiOperation({ summary: 'Update a care area' })
  updateArea(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateCareAreaDto) {
    return this.service.updateArea(user.id, id, dto);
  }

  @Delete('areas/:id')
  @ApiOperation({ summary: 'Delete a care area' })
  deleteArea(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteArea(user.id, id);
  }

  // Tasks
  @Get('areas/:areaId/tasks')
  @ApiOperation({ summary: 'List tasks for a care area' })
  getTasks(@CurrentUser() user: User, @Param('areaId') areaId: string) {
    return this.service.getTasks(user.id, areaId);
  }

  @Post('areas/:areaId/tasks')
  @ApiOperation({ summary: 'Create a task in a care area' })
  createTask(@CurrentUser() user: User, @Param('areaId') areaId: string, @Body() dto: CreateCareTaskDto) {
    return this.service.createTask(user, areaId, dto);
  }

  @Patch('areas/:areaId/tasks/:taskId')
  @ApiOperation({ summary: 'Update a care task' })
  updateTask(@CurrentUser() user: User, @Param('areaId') areaId: string, @Param('taskId') taskId: string, @Body() dto: UpdateCareTaskDto) {
    return this.service.updateTask(user.id, areaId, taskId, dto);
  }

  @Delete('areas/:areaId/tasks/:taskId')
  @ApiOperation({ summary: 'Delete a care task' })
  deleteTask(@CurrentUser() user: User, @Param('areaId') areaId: string, @Param('taskId') taskId: string) {
    return this.service.deleteTask(user.id, areaId, taskId);
  }

  // Activate / Deactivate in Today
  @Post('areas/:areaId/tasks/:taskId/activate')
  @ApiOperation({ summary: 'Add care task to Today routine' })
  activateTask(@CurrentUser() user: User, @Param('areaId') areaId: string, @Param('taskId') taskId: string) {
    return this.service.activateTask(user, areaId, taskId);
  }

  @Post('areas/:areaId/tasks/:taskId/deactivate')
  @ApiOperation({ summary: 'Remove care task from Today routine' })
  deactivateTask(@CurrentUser() user: User, @Param('areaId') areaId: string, @Param('taskId') taskId: string) {
    return this.service.deactivateTask(user.id, areaId, taskId);
  }
}
