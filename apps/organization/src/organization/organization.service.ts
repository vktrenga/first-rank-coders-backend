import { Injectable } from '@nestjs/common';
import {
  BaseResponse,
  AppException,
  PrismaService,
  AppLogger,
} from '@firstrankcoders/shared';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiClientService } from '../utils/api-client.service';

@Injectable()
export class OrganizationService {
  remove(id: string) {
    throw new Error('Method not implemented.');
  }
  findOne(id: string) {
    throw new Error('Method not implemented.');
  }
  update(id: string, updateDto: any) {
    throw new Error('Method not implemented.');
  }
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(
    private prisma: PrismaService,
    private apiClientService: ApiClientService,
    private appLogger : AppLogger,
  ) {}

  async create(
{ organizationDto }: { organizationDto: CreateOrganizationDto; },
  ): Promise<BaseResponse> {
    let organizationId: string | null =null;
    let authUserId: string | null =null;
    try {
      this.appLogger.log(`[OrganizationService: Create->Service] Started`);
      // 1. Add organization record first
      const adminUserEmail = organizationDto.adminUserEmail;
      delete (organizationDto as Partial<CreateOrganizationDto>).adminUserEmail;
      const password = organizationDto.password;
      delete (organizationDto as Partial<CreateOrganizationDto>).password;

      const organizationData = {
        ...organizationDto,
      };
      const organization = await this.prisma.organization.create({
        data: organizationData,
      });
      organizationId = organization.id;

      // Get Auth API base URL from environment variable
      this.appLogger.log(`[OrganizationService: Create->Service] Auth API calling Start`);
      const authBaseUrl =
        process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
      const authUrl = `${authBaseUrl}/auth/signup`;
      // 2. Call Auth API
      const authPayload = {
        email: adminUserEmail,
        password: password,
        isEmailVerified: false,
      };
      const authRes: any = await this.apiClientService.post(
        authUrl,
        authPayload,
      );

      if (!authRes || authRes.success !== true) {
        throw BaseResponse.error('Failed to create Auth record');
      }
      this.appLogger.log(`[OrganizationService: Create->Service] Auth API calling End`);


      authUserId = authRes.data.userId;
      this.appLogger.log(`[OrganizationService: Create->Service] User API calling Start`);

      // Get User API base URL from environment variable
      const userBaseUrl =
        process.env.USER_API_BASE_URL || 'http://localhost:3003';
      const userUrl = `${userBaseUrl}/users`;

      // 3. Call User API
      const userPayload = {
        email: adminUserEmail,
        name: organizationDto.name,
        organizationId: organization.id, 
        authUserId: authRes.data.userId,
      };

      const userRes: any = await this.apiClientService.post(
        userUrl,
        userPayload,
      );
      if (!userRes || userRes.success !== true) {
        throw BaseResponse.error('Failed to create user record');
      }
      this.appLogger.log(`[OrganizationService: Create->Service] User API calling End`);
      this.appLogger.log(`[OrganizationService: Create->Service] End`);
      return BaseResponse.success(organization,'Organization created successfully');
    } catch (error) {
      this.appLogger.log(`[OrganizationService: Create->Service] Auth or User API calling Error`);

      if (authUserId) {
        try {
          const authBaseUrl =
            process.env.AUTH_API_BASE_URL || 'http://localhost:3001';
          await this.apiClientService.delete(
            `${authBaseUrl}/auth/${authUserId}`,
          );
        } catch (e) {
          console.error('Failed to rollback auth user:', e.message);
        }
      }
      if (organizationId) {
        try {
          await this.prisma.organization.delete({
            where: { id: organizationId },
          });
        } catch (e) {
          console.error('Failed to rollback organization:', e.message);
        }
      }
      throw BaseResponse.error('Failed to Oragnization record');
    }
  }
}


