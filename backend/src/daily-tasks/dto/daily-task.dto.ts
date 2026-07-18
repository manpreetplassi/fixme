import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDailyTaskDto {
  @ApiPropertyOptional() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsString() day_type: string;
  @ApiPropertyOptional() @IsString() priority: string;
  @ApiPropertyOptional() @IsInt() @Min(0) points: number;
  @ApiPropertyOptional() @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_optional?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_bonus?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) max_cheats_per_week?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) display_order?: number;
}

export class UpdateDailyTaskDto extends CreateDailyTaskDto {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() is_enabled?: boolean;
}
