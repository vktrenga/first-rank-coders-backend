// libs/shared/database/src/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Global() // makes PrismaService available globally
@Module({
  imports: [ConfigModule], // ✅ important
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
