import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {

        console.log('LIB-level DATABASE_URL:', process.env.DATABASE_URL);

    const dbUrl =process.env.DATABASE_URL; // fallback used during super()
    super({
      datasources: { db: { url: dbUrl } },
    });
  }

  async onModuleInit() {
    // Optional recheck using ConfigService (it’s available now)
    console.log('LIB-level DATABASE_URL:', process.env.DATABASE_URL);

    const dbUrl =  process.env.DATABASE_URL
   await this.$connect();
    console.log(`✅ Connected to database: ${dbUrl}`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
