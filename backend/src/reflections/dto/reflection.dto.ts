import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReflectionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() what_went_well?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() what_didnt_work?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() primary_blocker?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() blocker_details?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() solution_to_try?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mood?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) energy_level?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() masturbation_happened?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() masturbation_trigger_log?: string;
}
