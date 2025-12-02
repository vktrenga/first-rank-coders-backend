import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@firstrankcoders/shared';
import { OrganizationController } from './organization/organization.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OrganizationModule,
    
  ],
  controllers: [OrganizationController],
  providers: [],  
})
export class AppModule {}