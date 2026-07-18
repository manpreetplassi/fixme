import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateReelDto, UpdateReelDto } from './dto/reel.dto';
import { ReelsVaultService } from './reels-vault.service';

@ApiTags('reels-vault')
@UseGuards(JwtAuthGuard)
@Controller('reels-vault')
export class ReelsVaultController {
  constructor(private readonly service: ReelsVaultService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateReelDto) {
    return this.service.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('category') category?: string, @Query('skip') skip = '0', @Query('take') take = '10') {
    return this.service.findAll(user.id, category, +skip, +take);
  }

  @Get('suggest/:blocker')
  suggestByBlocker(@CurrentUser() user: User, @Param('blocker') blocker: string) {
    return this.service.suggestByBlocker(user.id, blocker);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateReelDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }

  @Post(':id/suggest')
  suggest(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.suggest(id, user.id);
  }
}
