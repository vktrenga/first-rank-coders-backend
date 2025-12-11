import { Injectable, BadRequestException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { PrismaService, AppException } from '@firstrankcoders/shared';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AppLogger } from '@firstrankcoders/shared/';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';
import { AUTH_REFRESH_TOKEN_EXPIRY, AUTH_TOKEN_EXPIRY, ERROR_MESSAGES } from './constants/auth.constants';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthService.name); 
  }
  /**
   * Request password reset (send email with token)
   */
  async resetPassword(email: string) {
    // TODO: Generate password reset token and send email
    // Example: const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Save token to DB or send via emailr
    return  `Password reset link sent to ${email}`

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
    return  `Password changed successfully`
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
          return  `Invalid token or user not found`
      }
      await this.prisma.auth.update({
        where: { email: payload.email },
        data: { isEmailVerified: true },
      });
      return  `Email verified successfully`;
    } catch (error) {
      return  `Invalid or expired verification token`;
    }
  }
  

  /**
   * Sign up a new user with email and password
   */
  async signup(signupDto: SignupDto) {
  this.logger.log('Signup Started');
    try {
      const { email, password } = signupDto;
      const existingUser = await this.prisma.auth.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log('User already exists with email:', email);
        throw new AppException(ERROR_MESSAGES.USER_EXISTS, HttpStatus.CONFLICT, null, 'AUTH_USER_EXISTS');
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
      this.logger.log('Signup End');
      // TODO: Send verification email here (e.g., with a token link)
      return {
          authId: authUser.id,
          email: authUser.email,
        };
    } catch (error) {
      throw error;
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
        throw new AppException(ERROR_MESSAGES.AUTH_USER_NOT_FOUND, HttpStatus.CONFLICT, null, 'AUTH_USER_NOT_FOUND');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, authUser.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await this.prisma.auth.update({
          where: { id: authUser.id },
          data: { loginAttempts: authUser.loginAttempts + 1 },
        });
        throw new AppException(ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS, HttpStatus.CONFLICT, null, 'AUTH_INVALID_CREDENTIALS');

      }

      // Reset login attempts on successful login
      await this.prisma.auth.update({
        where: { id: authUser.id },
        data: { loginAttempts: 0 },
      });
           
      // Create access token with authUser.id
      // Fetch user details
      const userDetails = await this.prisma.user.findUnique({
        where: { authUserId: authUser.id },
      });
      if (!userDetails) {
        throw new AppException(ERROR_MESSAGES.AUTH_EMAIL_NOT_VERIFIED, HttpStatus.CONFLICT, null, 'AUTH_EMAIL_NOT_VERIFIED');
      }
      const accessToken = jwt.sign(
        { authId: authUser.id, email: authUser.email, role: userDetails.role , organizationId: userDetails.organizationId },
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

      
       return {
          userId: authUser.id,
          email: authUser.email,
          accessToken,
          refreshToken,
        }
      
    } catch (error) {
      throw error;
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
        throw  new AppException(ERROR_MESSAGES.AUTH_USER_NOT_FOUND, HttpStatus.CONFLICT, null, 'AUTH_USER_NOT_FOUND');
      }
      if (authUser.refreshToken !== refreshToken) {
        throw  new AppException(ERROR_MESSAGES.INVALID_CREDENTIALS, HttpStatus.CONFLICT, null, 'AUTH_INVALID_CREDENTIALS');

      }

      // Issue new access token
      const accessToken = jwt.sign(
        { authId: authUser.id, email: authUser.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: AUTH_TOKEN_EXPIRY }
      );

      return {
          userId: authUser.id,
          email: authUser.email,
          accessToken,
        }
    } catch (error) {
      throw error
    }
  }
  async deleteUser(userId: string) {
    this.logger.log('Deleting user', userId);
    try {
      await this.prisma.auth.delete({ where: { id: userId } });
      return 'User deleted successfully'
    } catch (error) {
        throw  new AppException(ERROR_MESSAGES.AUTH_DELETE_FAILED, HttpStatus.CONFLICT, null, 'AUTH_DELETE_FAILED');

    }
  }
}