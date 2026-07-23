import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DeleteUserDataDto, UpdateUserGoalsDto, UpdateUserProfileDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: User) {
    return this.usersService.sanitizeUser(user);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Put('goals')
  @ApiOperation({ summary: 'Update user goals' })
  updateGoals(@CurrentUser() user: User, @Body() dto: UpdateUserGoalsDto) {
    return this.usersService.updateGoals(user.id, dto);
  }

  @Get('data/counts')
  @ApiOperation({ summary: 'Get row counts per deletable category' })
  getDataCounts(@CurrentUser() user: User) {
    return this.usersService.getDataCounts(user.id);
  }

  @Delete('data')
  @ApiOperation({ summary: 'Delete selected data categories for the current user' })
  deleteData(@CurrentUser() user: User, @Body() dto: DeleteUserDataDto) {
    return this.usersService.deleteData(user.id, dto);
  }
}
