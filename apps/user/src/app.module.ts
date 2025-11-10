 import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as shared  from '@firstrankcoders/shared';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'libs/shared/database/prisma/.env', // points to shared env
    }),
    
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
