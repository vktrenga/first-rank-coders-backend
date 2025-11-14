import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from '@firstrankcoders/shared';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AppService - Authentication', () => {
  let service: AppService;
  let prisma: PrismaService;

  const mockPrismaService = {
    auth: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully register a new user', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        name: 'Test User',
      };

      const mockAuthUser = {
        id: 'auth-uuid',
        email: signupDto.email,
        password: 'hashed-password',
        refreshToken: '',
        loginAttempts: 0,
      };

      const mockUser = {
        id: 'user-uuid',
        authUserId: mockAuthUser.id,
        name: signupDto.name,
        email: signupDto.email,
        password: 'hashed-password',
        role: 'STUDENT',
        organizationId: null,
        departmentId: null,
        classId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.auth.findUnique.mockResolvedValue(null);
      mockPrismaService.auth.create.mockResolvedValue(mockAuthUser);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.signup(signupDto);

      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('password');
      expect(result.message).toBe('User registered successfully');
      expect(mockPrismaService.auth.create).toHaveBeenCalled();
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const signupDto: SignupDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123',
        name: 'Test User',
      };

      mockPrismaService.auth.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: signupDto.email,
      });

      await expect(service.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should hash password during signup', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        name: 'Test User',
      };

      mockPrismaService.auth.findUnique.mockResolvedValue(null);
      mockPrismaService.auth.create.mockResolvedValue({
        id: 'auth-uuid',
        email: signupDto.email,
        password: 'hashed-password',
        refreshToken: '',
        loginAttempts: 0,
      });

      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid',
        authUserId: 'auth-uuid',
        name: signupDto.name,
        email: signupDto.email,
        password: 'hashed-password',
        role: 'STUDENT',
        organizationId: null,
        departmentId: null,
        classId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.signup(signupDto);

      // Verify that the password was hashed before being saved
      const createCall = mockPrismaService.auth.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(signupDto.password);
    });
  });

  describe('login', () => {
    it('should successfully login user with correct credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);

      const mockAuthUser = {
        id: 'auth-uuid',
        email: loginDto.email,
        password: hashedPassword,
        refreshToken: 'refresh-token',
        loginAttempts: 0,
      };

      const mockUser = {
        id: 'user-uuid',
        authUserId: mockAuthUser.id,
        name: 'Test User',
        email: loginDto.email,
        password: hashedPassword,
        role: 'STUDENT',
        organizationId: null,
        departmentId: null,
        classId: null,
        organization: null,
        department: null,
        class: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.auth.findUnique.mockResolvedValue(mockAuthUser);
      mockPrismaService.auth.update.mockResolvedValue(mockAuthUser);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.data?.user).not.toHaveProperty('password');
      expect(result.data).toHaveProperty('token');
      expect(result.message).toBe('Login successful');
      expect(mockPrismaService.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuthUser.id },
        data: { loginAttempts: 0 },
      });
    });

    it('should throw error if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123',
      };

      mockPrismaService.auth.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockAuthUser = {
        id: 'auth-uuid',
        email: loginDto.email,
        password: 'hashed-different-password',
        refreshToken: 'refresh-token',
        loginAttempts: 0,
      };

      mockPrismaService.auth.findUnique.mockResolvedValue(mockAuthUser);
      mockPrismaService.auth.update.mockResolvedValue({
        ...mockAuthUser,
        loginAttempts: 1,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuthUser.id },
        data: { loginAttempts: 1 },
      });
    });

    it('should increment login attempts on failed login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockAuthUser = {
        id: 'auth-uuid',
        email: loginDto.email,
        password: 'hashed-correct-password',
        refreshToken: 'refresh-token',
        loginAttempts: 2,
      };

      mockPrismaService.auth.findUnique.mockResolvedValue(mockAuthUser);
      mockPrismaService.auth.update.mockResolvedValue({
        ...mockAuthUser,
        loginAttempts: 3,
      });

      try {
        await service.login(loginDto);
      } catch (error) {
        // Expected to fail
      }

      expect(mockPrismaService.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuthUser.id },
        data: { loginAttempts: 3 },
      });
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const userId = 'user-id';
      const password = 'SecurePassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockPrismaService.auth.findUnique.mockResolvedValue({
        id: userId,
        password: hashedPassword,
      });

      const result = await service.verifyPassword(userId, password);

      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const userId = 'user-id';
      const correctPassword = 'SecurePassword123';
      const wrongPassword = 'WrongPassword';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);

      mockPrismaService.auth.findUnique.mockResolvedValue({
        id: userId,
        password: hashedPassword,
      });

      const result = await service.verifyPassword(userId, wrongPassword);

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      mockPrismaService.auth.findUnique.mockResolvedValue(null);

      const result = await service.verifyPassword('nonexistent-id', 'password');

      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const userId = 'user-id';
      const newPassword = 'NewSecurePassword123';

      mockPrismaService.auth.update.mockResolvedValue({
        id: userId,
        password: 'hashed-new-password',
      });

      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-uuid',
        authUserId: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-new-password',
        role: 'STUDENT',
      });

      const result = await service.updatePassword(userId, newPassword);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password updated successfully');
      expect(mockPrismaService.auth.update).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });
});
