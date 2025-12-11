import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrganizationService } from './organization.service';
import {  AppLogger, JwtAuthGuard, PrismaModule } from '@firstrankcoders/shared';
import { ApiClientService } from '../utils/api-client.service';
import { RolesGuard } from '../guards/auth.guard';
import { PermissionGuard } from 'src/guards/permission.guard';
import { PermissionModule } from 'src/guards/permission.module';

@Module({
  imports: [PrismaModule, HttpModule,PermissionModule  ],
  providers: [OrganizationService, ApiClientService, AppLogger, JwtAuthGuard, RolesGuard, PermissionGuard],
  exports: [OrganizationService,ApiClientService]
})
export class OrganizationModule {}
