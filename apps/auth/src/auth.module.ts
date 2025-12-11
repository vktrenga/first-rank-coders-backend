import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { MaskService, PrismaModule } from '@firstrankcoders/shared';
import { AppLogger } from '@firstrankcoders/shared/';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AppLogger, MaskService],
})
export class AuthModule {}
