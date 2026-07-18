import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@fixme.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'fixme2026' })
  @IsString()
  @MinLength(6)
  password: string;
}
