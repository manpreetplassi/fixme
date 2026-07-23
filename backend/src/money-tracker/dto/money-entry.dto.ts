import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMoneyEntryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) amount?: number | null;
  @ApiPropertyOptional() @IsDateString() log_date: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parent_entry_id?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_recurring?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() recurrence_rule?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() needs_price?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() source_type?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsUUID() source_id?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() plan_id?: string | null;
}

export class UpdateMoneyEntryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) amount?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() log_date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parent_entry_id?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_recurring?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() recurrence_rule?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() needs_price?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() source_type?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsUUID() source_id?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() plan_id?: string | null;
}
