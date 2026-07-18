import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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
