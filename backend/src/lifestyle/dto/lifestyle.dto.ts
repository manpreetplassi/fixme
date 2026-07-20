import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertLifestyleDayDto {
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() wake_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sleep_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sleep_hours?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['excellent', 'good', 'average', 'poor', 'missed']) sleep_quality?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() water_litres?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['great', 'good', 'okay', 'low', 'bad']) mood?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['low', 'medium', 'high']) morning_energy?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['low', 'medium', 'high']) night_energy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() screen_shutdown_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class MealDto {
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsIn(['breakfast', 'lunch', 'snack', 'dinner']) meal_type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meal_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meal_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() food_items?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() homemade?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() outside_food?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() leftover_from_dinner?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() restaurant?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sabzi_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) roti_count?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() rice?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() dal?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() salad?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() curd?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() fruits?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() tea?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() coffee?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() outside_reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() quantity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class MealTemplateDto {
  @ApiPropertyOptional() @IsString() name: string;
  @ApiPropertyOptional() @IsIn(['breakfast', 'lunch', 'snack', 'dinner']) meal_type: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() food_items?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() homemade?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() sabzi_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) roti_count?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ActivityDto {
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional() @IsIn(['exercise', 'productivity']) activity_type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() start_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() end_time?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) duration_minutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() project_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) calories?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
