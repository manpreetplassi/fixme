import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLearningLogDto {
  @ApiPropertyOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  key_notes: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailed_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code_link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tags?: string;
}

export class UpdateLearningLogDto extends CreateLearningLogDto {}
