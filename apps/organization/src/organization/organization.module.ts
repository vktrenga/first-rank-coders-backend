import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrganizationService } from './organization.service';
import {  AppLogger, JwtAuthGuard, PrismaModule } from '@firstrankcoders/shared';
import { ApiClientService } from '../utils/api-client.service';
import { RolesGuard } from '../guards/auth.guard';

@Module({
  imports: [PrismaModule, HttpModule  ],
  providers: [OrganizationService, ApiClientService, AppLogger, JwtAuthGuard, RolesGuard],
  exports: [OrganizationService,ApiClientService]
})
export class OrganizationModule {}
