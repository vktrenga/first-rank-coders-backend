import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService, BaseResponse } from '@firstrankcoders/shared';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AppLogger, MaskService } from '@firstrankcoders/shared/';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';
import { AUTH_REFRESH_TOKEN_EXPIRY, AUTH_TOKEN_EXPIRY, ERROR_MESSAGES } from './constants/auth.constants';
import jwt from 'jsonwebtoken';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly maskService: MaskService,
  ) {}
  /**
   * Request password reset (send email with token)
   */
  async resetPassword(email: string) {
    // TODO: Generate password reset token and send email
    // Example: const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Save token to DB or send via email
    return BaseResponse.success(null, `Password reset link sent to ${email}`);
  }

  /**
   * Change password (requires old password)
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // // Find user
    // const authUser = await this.prisma.auth.findUnique({ where: { id: userId } });
    // if (!authUser) {
    //   return BaseResponse.error('User not found', null);
    // }
    // // Verify old password
    // const isValid = await bcrypt.compare(oldPassword, authUser.password);
    // if (!isValid) {
    //   return BaseResponse.error('Old password is incorrect', null);
    // }
    // // Hash new password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await this.prisma.auth.update({
    //   where: { id: userId },
    //   data: { password: hashedPassword },
    // });
    // await this.prisma.user.update({
    //   where: { authUserId: userId },
    //   data: { password: hashedPassword },
    // });
    return BaseResponse.success(null, 'Password changed successfully');
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string) {
    // TODO: Decode token, find user, set isEmailVerified to true
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { email: string };
      const authUser = await this.prisma.auth.findUnique({ where: { email: payload.email } });
      if (!authUser) {
        return BaseResponse.error('Invalid token or user not found', null);
      }
      await this.prisma.auth.update({
        where: { email: payload.email },
        data: { isEmailVerified: true },
      });
      return BaseResponse.success(null, 'Email verified successfully');
    } catch (error) {
      return BaseResponse.error('Invalid or expired verification token', null);
    }
  }
  

  /**
   * Sign up a new user with email and password
   */
  async signup(signupDto: SignupDto) {
  this.logger.log('Signup attempt', this.maskService.maskEmail(signupDto.email));
    try {
      const { email, password } = signupDto;
      const existingUser = await this.prisma.auth.findUnique({
        where: { email },
      });

      if (existingUser) {
        return BaseResponse.error(ERROR_MESSAGES.USER_EXISTS, null);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create refresh token
      const refreshToken = jwt.sign(
        { authId: email },
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY }
      );
      // Create user in Auth model with isEmailVerified: false
      const authUser = await this.prisma.auth.create({
        data: {
          email,
          password: hashedPassword,
          refreshToken: refreshToken,
          loginAttempts: 0,
        },
      });

      // TODO: Send verification email here (e.g., with a token link)

      return BaseResponse.success(
        {
          userId: authUser.id,
          email: authUser.email,
        },
        'Signup completed successfully. Please verify your email.',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        return BaseResponse.error(error.message, null);
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return BaseResponse.error('User with this email already exists', null);
      }
      return BaseResponse.error('Signup failed', null);
    }
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto) {
  this.logger.log('Login attempt', loginDto.email);
    try {
      const { email, password } = loginDto;

      // Find user by email
      const authUser = await this.prisma.auth.findUnique({
        where: { email },
      });

      if (!authUser) {
        return BaseResponse.error(ERROR_MESSAGES.INVALID_CREDENTIALS, null);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, authUser.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await this.prisma.auth.update({
          where: { id: authUser.id },
          data: { loginAttempts: authUser.loginAttempts + 1 },
        });

        return BaseResponse.error(ERROR_MESSAGES.INVALID_CREDENTIALS, null);
      }

      // Reset login attempts on successful login
      await this.prisma.auth.update({
        where: { id: authUser.id },
        data: { loginAttempts: 0 },
      });
           
      // Create access token with authUser.id
      const accessToken = jwt.sign(
        { authId: authUser.id, email: authUser.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: AUTH_TOKEN_EXPIRY }
      );
      const refreshToken = jwt.sign(
        { authId: authUser.id },
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY }
      );

      // Save refresh token to user record
      await this.prisma.auth.update({
        where: { id: authUser.id },
        data: { refreshToken },
      });

      return BaseResponse.success(
        {
          userId: authUser.id,
          email: authUser.email,
          accessToken,
          refreshToken,
        },
        'Login successful'
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return BaseResponse.error(error.message, null);
      }
      return BaseResponse.error('Login failed', null);
    }
  }

  /**
   * Verify password for user
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
  this.logger.debug('Verifying password for user', userId);
    const authUser = await this.prisma.auth.findUnique({
      where: { id: userId },
    });

    if (!authUser) {
      return false;
    }

    return bcrypt.compare(password, authUser.password);
  }

  /**
   * Update password for user
   */
  async updatePassword(userId: string, newPassword: string) {
  // this.logger.warn('Password update requested for user', userId);
  //   try {
  //     const hashedPassword = await bcrypt.hash(newPassword, 10);

  //     const authUser = await this.prisma.auth.update({
  //       where: { id: userId },
  //       data: { password: hashedPassword },
  //     });

      

  //     const { password: _, ...userWithoutPassword } = user;
  //     return BaseResponse.success(userWithoutPassword, 'Password updated successfully');
  //   } catch (error) {
  //     return BaseResponse.error('Password update failed', null);
  //   }
  }

  /**
   * Authenticate user using refresh token
   */
  async authenticateWithRefreshToken(refreshToken: string) {
  this.logger.log('Authenticating with refresh token');
    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
      ) as { authId: string };

      // Find user by id and match refresh token
      const authUser = await this.prisma.auth.findUnique({
        where: { id: payload.authId },
      });

      if (!authUser) {
        return BaseResponse.error('User not found', null);
      }
      if (authUser.refreshToken !== refreshToken) {
        return BaseResponse.error(ERROR_MESSAGES.INVALID_CREDENTIALS, null);
      }

      // Issue new access token
      const accessToken = jwt.sign(
        { authId: authUser.id, email: authUser.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: AUTH_TOKEN_EXPIRY }
      );

      return BaseResponse.success(
        {
          userId: authUser.id,
          email: authUser.email,
          accessToken,
        },
        'Authenticated with refresh token'
      );
    } catch (error) {
      return BaseResponse.error('Invalid or expired refresh token', null);
    }
  }
}
