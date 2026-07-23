import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dark_mode?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifications_enabled?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  preferred_hobbies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  addiction_label?: string;
}

export class UpdateUserGoalsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wake_target?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sleep_target?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  exercise_minutes_target?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  daily_zomato_avoidance_savings?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  weekly_reward_threshold?: number;
}

export const DELETABLE_CATEGORIES = [
  'routine_completions',
  'routine_items',
  'money_tracker',
  'learning_logs',
  'reflections',
  'lifestyle_activities',
  'meal_entries',
  'hobby_logs',
  'streaks',
] as const;

export type DeletableCategory = (typeof DELETABLE_CATEGORIES)[number];

export class DeleteUserDataDto {
  @ApiProperty({ type: [String], enum: DELETABLE_CATEGORIES })
  @IsArray()
  @IsIn(DELETABLE_CATEGORIES, { each: true })
  categories: DeletableCategory[];
}
