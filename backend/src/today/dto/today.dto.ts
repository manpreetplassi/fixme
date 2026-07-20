import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateRoutineItemDto {
  @ApiPropertyOptional() @IsString() title: string;
  @ApiPropertyOptional() @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @Matches(timePattern) time_block?: string | null;
  @ApiPropertyOptional() @IsIn(['urgent', 'important', 'low']) priority: string;
  @ApiPropertyOptional() @IsIn(['daily', 'weekdays', 'weekly', 'once']) repeat_rule: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() reminder_enabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) display_order?: number;
}

export class UpdateRoutineItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(timePattern) time_block?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsIn(['urgent', 'important', 'low']) priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['daily', 'weekdays', 'weekly', 'once']) repeat_rule?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() reminder_enabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) display_order?: number;
}

export class SetRoutineDoneDto {
  @ApiPropertyOptional() @IsBoolean() is_done: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class ScreenCheckInDto {
  @ApiPropertyOptional() @IsBoolean() watched: boolean;
  @ApiPropertyOptional() @IsOptional() @IsIn(['morning', 'night']) period?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['reel_short', 'youtube', 'movie', 'show', 'other']) content_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title_note?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(timePattern) stopped_watching_at?: string;
}
