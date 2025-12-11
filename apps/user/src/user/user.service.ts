import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AppException,
  AppLogger,
  PrismaExceptionMapper,
  PrismaService,
} from '@firstrankcoders/shared';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { ApiClientService } from '../utils/api-client.service';
import { response } from 'express';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private appLogger: AppLogger,
    private apiClientService: ApiClientService,
  ) {}
  async create(data: CreateUserDto) {
    try {
      const createData: any = { ...data };
      if (data.organizationId) {
        const org = await this.prisma.organization.findUnique({
          where: { id: data.organizationId },
        });

        if (!org) {
          throw new BadRequestException('Organization does not exist yet.');
        }
        createData.organizationId = org.id;
      }
      if (data?.authUserId) {
        createData.authUserId = data.authUserId;
      } else {
        const authBaseUrl =
          process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
        const authUrl = `${authBaseUrl}/auth/signup`;
        const authPayload = {
          email: data.email,
          password: data.password,
          isEmailVerified: false,
        };
        const authRes: any = await this.apiClientService.post(
          authUrl,
          authPayload,
        );
        if (!authRes?.status) {
          throw authRes?.response?.data;
        }
        createData.authUserId = authRes?.data?.authId;
      }
      delete createData?.password;
      const user = await this.prisma.user.create({ data: createData });
      return user;
    } catch (error) {
      console.log('error', error);
      const mapped = PrismaExceptionMapper.map(error);
    if (mapped) throw mapped
      const eroorData = error?.response?.data;
      this.appLogger.error(
        `Failed to create user: ${JSON.stringify(error)}`,
      );
      throw new AppException(
        eroorData.message || 'Failed to create organization',
        eroorData.status || HttpStatus.INTERNAL_SERVER_ERROR,
        eroorData.errors || null,
        eroorData.errorCode || 'USER_CREATE_ERROR',
      );
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { organization: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    // return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
