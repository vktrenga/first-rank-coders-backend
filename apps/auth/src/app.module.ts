import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MaskService, PrismaModule } from '@firstrankcoders/shared';
import { AppLogger } from '@firstrankcoders/shared/';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [AppController],
  providers: [AppService, AppLogger, MaskService],
})
export class AppModule {}
