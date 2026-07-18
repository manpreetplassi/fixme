import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateReelDto {
  @ApiPropertyOptional() @IsString() reel_url: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() user_notes?: string;
}

export class UpdateReelDto {
  @ApiPropertyOptional() @IsOptional() @IsString() user_notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() linked_triggers?: string[];
}
