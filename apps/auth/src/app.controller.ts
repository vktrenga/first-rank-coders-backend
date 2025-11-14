import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Auth')
@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Register a new user
   * POST /auth/signup
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async signup(@Body() signupDto: SignupDto) {
    return this.appService.signup(signupDto);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and get tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    return this.appService.login(loginDto);
  }
/**
 * Request password reset
 * POST /auth/reset-password
 */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.appService.resetPassword(dto.email);
  }

/**
 * Change password
 * POST /auth/change-password
 */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.appService.changePassword(dto.userId, dto.oldPassword, dto.newPassword);
  }

/**
 * Verify email
 * POST /auth/verify-email
 */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.appService.verifyEmail(dto.token);
  }

  /**
   * Authenticate with refresh token
   * POST /auth/refresh-token
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async authenticateWithRefreshToken(@Body() dto: RefreshTokenDto) {
    return this.appService.authenticateWithRefreshToken(dto.refreshToken);
  }
}
