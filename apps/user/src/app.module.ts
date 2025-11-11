 import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {UtilsService, PrismaModule }  from '@firstrankcoders/shared';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'], // adjust per app
    }),
    PrismaModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, UtilsService],
  exports: [AppService],
})
export class AppModule {}
