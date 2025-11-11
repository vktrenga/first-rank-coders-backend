

import { Injectable } from '@nestjs/common';
import { UtilsService, PrismaService } from '@firstrankcoders/shared';

@Injectable()
export class AppService {
  constructor (private readonly utilsService: UtilsService, private readonly prismaService: PrismaService) { 
  }
  getHello(): string {
    this.prismaService.user.findMany();
    return  " User Service "+ this.utilsService.currentDateTime();
  }
}
