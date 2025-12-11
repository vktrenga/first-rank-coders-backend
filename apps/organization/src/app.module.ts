import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@firstrankcoders/shared';
import { OrganizationController } from './organization/organization.controller';
import { RolesGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionModule } from './guards/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OrganizationModule,
    PermissionModule,
  ],
  controllers: [OrganizationController],
  providers: [RolesGuard, PermissionGuard],  
})
export class AppModule {}