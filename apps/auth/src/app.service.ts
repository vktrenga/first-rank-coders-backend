import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService, BaseResponse } from '@firstrankcoders/shared';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';
import jwt from 'jsonwebtoken';

@Injectable()
export class AppService {
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
    // Find user
    const authUser = await this.prisma.auth.findUnique({ where: { id: userId } });
    if (!authUser) {
      throw new BadRequestException('User not found');
    }
    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, authUser.password);
    if (!isValid) {
      throw new BadRequestException('Old password is incorrect');
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.auth.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    await this.prisma.user.update({
      where: { authUserId: userId },
      data: { password: hashedPassword },
    });
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
        throw new BadRequestException('Invalid token or user not found');
      }
      await this.prisma.auth.update({
        where: { email: payload.email },
        data: { isEmailVerified: true },
      });
      return BaseResponse.success(null, 'Email verified successfully');
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sign up a new user with email and password
   */
  async signup(signupDto: SignupDto) {
    try {
      const { email, password } = signupDto;
      const existingUser = await this.prisma.auth.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create refresh token
      const refreshToken = jwt.sign(
        { authId: email },
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        { expiresIn: '7d' }
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
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user by email
      const authUser = await this.prisma.auth.findUnique({
        where: { email },
      });

      if (!authUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, authUser.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await this.prisma.auth.update({
          where: { id: authUser.id },
          data: { loginAttempts: authUser.loginAttempts + 1 },
        });

        throw new UnauthorizedException('Invalid credentials');
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
            { expiresIn: '1h' }
            );
            const refreshToken = jwt.sign(
            { authId: authUser.id },
            process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
            { expiresIn: '7d' }
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
        throw error;
      }
      throw error;
    }
  }

  /**
   * Verify password for user
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
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
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const authUser = await this.prisma.auth.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      const user = await this.prisma.user.update({
        where: { authUserId: userId },
        data: { password: hashedPassword },
      });

      const { password: _, ...userWithoutPassword } = user;
      return BaseResponse.success(userWithoutPassword, 'Password updated successfully');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate user using refresh token
   */
  async authenticateWithRefreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
      ) as { authId: string };
111
      // Find user by id and match refresh token
      const authUser = await this.prisma.auth.findUnique({
        where: { id: payload.authId },
      });

      if (!authUser || authUser.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Issue new access token
      const accessToken = jwt.sign(
        { authId: authUser.id, email: authUser.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
