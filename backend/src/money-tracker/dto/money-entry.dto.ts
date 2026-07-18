import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMoneyEntryDto {
  @ApiPropertyOptional() @IsNumber() @Min(0) amount: number;
  @ApiPropertyOptional() @IsDateString() log_date: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
