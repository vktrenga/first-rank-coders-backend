import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppLogger, JwtAuthGuard, PrismaModule, RolesGuard } from '@firstrankcoders/shared/';
import { ApiClientService } from '../utils/api-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [UserController],
  providers: [UserService, ApiClientService, AppLogger, JwtAuthGuard, RolesGuard],
  exports: [UserService, ApiClientService],
})
export class UserModule {}
