import { Injectable, HttpStatus } from '@nestjs/common';
import {
  AppException,
  PrismaService,
  AppLogger,
} from '@firstrankcoders/shared';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiClientService } from '../utils/api-client.service';
import { Organization, Role } from '@prisma/client';
import { Permission } from '../decorator/permission.decorator';
import axios, { AxiosError } from 'axios';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private apiClientService: ApiClientService,
    private appLogger: AppLogger,
  ) {
    this.appLogger.setContext(OrganizationService.name);
  }

  async create({
    organizationDto,
  }: {
    organizationDto: CreateOrganizationDto;
  }): Promise<Organization> {
    let organizationId: string | null = null;
    let authUserId: string | null = null;
    try {
      this.appLogger.log(`Started`);
      const { adminUserEmail, password, ...orgData } = organizationDto;
      // 1. Add organization record first
      const organization = await this.prisma.organization.create({
        data: orgData,
      });
      organizationId = organization.id;
      // 2. Call Auth API
      this.appLogger.log(`Auth API calling Start`);
      const authBaseUrl =
        process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
      const authUrl = `${authBaseUrl}/auth/signup`;
      const authPayload = {
        email: adminUserEmail,
        password,
        isEmailVerified: false,
      };
      const authRes: any = await this.apiClientService.post(
        authUrl,
        authPayload,
      );
      if (!authRes?.status) {
        throw authRes?.response?.data;
      }
      this.appLogger.log(`Auth API calling End`);
      authUserId = authRes?.data?.authId;
      console.log('authRes', authUserId);
      // 3. Call User API
      this.appLogger.log(`User API calling Start`);
      const userBaseUrl =
        process.env.USER_API_BASE_URL || 'http://localhost:3003';
      const userUrl = `${userBaseUrl}/users`;
      const userPayload = {
        email: adminUserEmail,
        name: organization.name,
        organizationId: organization.id,
        authUserId,
        role: Role.ORG_ADMIN,
      };
      const userRes: any = await this.apiClientService.post(
        userUrl,
        userPayload,
      );
      console.log('userRes', userRes);
      if (!userRes?.status) {
        this.appLogger.error(`User API calling Failed`);
        throw new AppException(
          userRes?.message || 'Failed to create User record',
          HttpStatus.INTERNAL_SERVER_ERROR,
          userRes?.errors || null,
          'ORG_USER_ERROR',
        );
      }
      this.appLogger.log(`User API calling End`);
      this.appLogger.log(`End`);
      return { ...organization };
    } catch (error: any) {
      // Cleanup: delete created Auth and Organization if error occurs
      if (authUserId) {
        try {
          const authBaseUrl =
            process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
          await this.apiClientService.delete(
            `${authBaseUrl}/auth/${authUserId}`,
          );
        } catch (cleanupError) {
          this.appLogger.error(
            `Failed to delete auth user ${cleanupError?.message}`,
          );
        }
      }
      if (organizationId) {
        try {
          await this.prisma.organization.delete({
            where: { id: organizationId },
          });
        } catch (cleanupError) {
          this.appLogger.error(
            `Failed to delete organization ${cleanupError?.message}`,
          );
        }
      }
      const eroorData = error?.response?.data;
      throw new AppException(
        eroorData.message || 'Failed to create organization',
        eroorData.status || HttpStatus.INTERNAL_SERVER_ERROR,
        eroorData.errors || null,
        eroorData.errorCode || 'ORG_CREATE_ERROR',
      );
    }
  }

  @Permission('org:create')
  async findAll(user): Promise<any[]> {
    let queryFilter = {};
    if (user.organizationId) {
      queryFilter = { id: user.organizationId };
    }
    return this.prisma.organization.findMany({ where: queryFilter });
  }

  async findOne(id: string): Promise<any> {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async update(id: string, updateDto: any): Promise<any> {
    return this.prisma.organization
      .update({
        where: { id },
        data: updateDto,
      })
      .catch(() => null);
  }
}
