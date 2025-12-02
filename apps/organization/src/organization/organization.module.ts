import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrganizationService } from './organization.service';
import {  AppLogger, PrismaModule } from '@firstrankcoders/shared';
import { ApiClientService } from '../utils/api-client.service';

@Module({
  imports: [PrismaModule, HttpModule  ],
  providers: [OrganizationService, ApiClientService, AppLogger],
  exports: [OrganizationService,ApiClientService]
})
export class OrganizationModule {}
