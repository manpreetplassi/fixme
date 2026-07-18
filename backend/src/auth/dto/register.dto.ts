import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'demo@fixme.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@123' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({ example: 'FixMe User' })
  @IsString()
  @MaxLength(255)
  name: string;
}
