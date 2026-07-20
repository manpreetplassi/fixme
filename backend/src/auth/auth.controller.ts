import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Returns JWT token and user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    res.cookie('token', result.accessToken, this.authCookieOptions());
    return result;
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email + password' })
  @ApiResponse({ status: 200, description: 'Returns JWT token and user' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('token', result.accessToken, this.authCookieOptions());
    return result;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear auth cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', this.authCookieOptions());
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  me(@CurrentUser() user: User) {
    const { password_hash, ...safe } = user;
    return safe;
  }

  private authCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }
}
