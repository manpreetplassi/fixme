import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Min } from 'class-validator';
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
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) points?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() linked_money_entry_id?: string | null;
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
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) points?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() linked_money_entry_id?: string | null;
}

export class SetRoutineDoneDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_done?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsIn(['not_started', 'done', 'completed', 'failed', 'skipped']) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) points_earned?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) duration_minutes?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) rating?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsUUID() linked_money_entry_id?: string | null;
}

export class ScreenCheckInDto {
  @ApiPropertyOptional() @IsBoolean() watched: boolean;
  @ApiPropertyOptional() @IsOptional() @IsIn(['morning', 'night']) period?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['reel_short', 'youtube', 'movie', 'show', 'other']) content_type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title_note?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(timePattern) stopped_watching_at?: string;
}
