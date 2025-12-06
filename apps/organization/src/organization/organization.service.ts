import { Injectable, HttpStatus } from '@nestjs/common';
import {
  BaseResponse,
  AppException,
  PrismaService,
  AppLogger,
} from '@firstrankcoders/shared';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiClientService } from '../utils/api-client.service';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private apiClientService: ApiClientService,
    private appLogger: AppLogger,
  ) {}

  async create({ organizationDto }: { organizationDto: CreateOrganizationDto }): Promise<BaseResponse> {
    let organizationId: string | null = null;
    let authUserId: string | null = null;
    try {
      this.appLogger.log(`[OrganizationService: Create->Service] Started`);
      const { adminUserEmail, password, ...orgData } = organizationDto;
      // 1. Add organization record first
      const organization = await this.prisma.organization.create({ data: orgData });
      organizationId = organization.id;
      // 2. Call Auth API
      this.appLogger.log(`[OrganizationService: Create->Service] Auth API calling Start`);
      const authBaseUrl = process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
      const authUrl = `${authBaseUrl}/auth/signup`;
      const authPayload = { email: adminUserEmail, password, isEmailVerified: false };
      const authRes: any = await this.apiClientService.post(authUrl, authPayload);
      if (!authRes?.status) {
        this.appLogger.log(`[OrganizationService: Create->Service] Auth API calling Failed`, JSON.stringify(authRes));
        throw new AppException(
           'Failed to create Auth record',
          authRes?.status || HttpStatus.CONFLICT,
          authRes?.errors ,
          'ORG_AUTH_ERROR'
        );
      }
      this.appLogger.log(`[OrganizationService: Create->Service] Auth API calling End`);
      authUserId = authRes.data.userId;
      // 3. Call User API
      this.appLogger.log(`[OrganizationService: Create->Service] User API calling Start`);
      const userBaseUrl = process.env.USER_API_BASE_URL || 'http://localhost:3003';
      const userUrl = `${userBaseUrl}/users`;
      const userPayload = {
        email: adminUserEmail,
        name: organization.name,
        organizationId: organization.id,
        authUserId,
        role: Role.ORG_ADMIN,
      };
      const userRes: any = await this.apiClientService.post(userUrl, userPayload);
      if (!userRes?.status) {
        this.appLogger.log(`[OrganizationService: Create->Service] User API calling Failed`, JSON.stringify(userRes));
        throw new AppException(
          userRes?.message || 'Failed to create User record',
          HttpStatus.INTERNAL_SERVER_ERROR,
          userRes?.errors || null,
          'ORG_USER_ERROR'
        );
      }
      this.appLogger.log(`[OrganizationService: Create->Service] User API calling End`);
      this.appLogger.log(`[OrganizationService: Create->Service] End`);
      return BaseResponse.success(organization, 'Organization created successfully');
    } catch (error: any) {
      this.appLogger.log(`[OrganizationService: Create->Service] Auth or User API calling Error`, error?.message);
      // Cleanup: delete created Auth and Organization if error occurs
      if (authUserId) {
        try {
          const authBaseUrl = process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
          await this.apiClientService.delete(`${authBaseUrl}/auth/${authUserId}`);
        } catch (cleanupError) {
          this.appLogger.error(`[OrganizationService: Cleanup] Failed to delete auth user`, cleanupError?.message);
        }
      }
      if (organizationId) {
        try {
          await this.prisma.organization.delete({ where: { id: organizationId } });
        } catch (cleanupError) {
          this.appLogger.error(`[OrganizationService: Cleanup] Failed to delete organization`, cleanupError?.message);
        }
      }
      throw new AppException(
        error?.message || 'Failed to create organization',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error?.errors || null,
        'ORG_CREATION_ERROR'
      );
    }
  }

  
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
}
