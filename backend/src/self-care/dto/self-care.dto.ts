import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCareAreaDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsInt() @Min(0) display_order?: number;
}

export class UpdateCareAreaDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsInt() @Min(0) display_order?: number;
  @IsOptional() @IsBoolean() is_active?: boolean;
}

export class CreateCareTaskDto {
  @IsString() @MaxLength(200) title: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsIn(['daily', 'weekly', 'monthly', 'custom']) frequency?: string;
  @IsOptional() @IsIn(['urgent', 'important', 'low']) priority?: string;
  @IsOptional() @IsInt() @Min(0) display_order?: number;
}

export class UpdateCareTaskDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsIn(['daily', 'weekly', 'monthly', 'custom']) frequency?: string;
  @IsOptional() @IsIn(['urgent', 'important', 'low']) priority?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
  @IsOptional() @IsInt() @Min(0) display_order?: number;
}
