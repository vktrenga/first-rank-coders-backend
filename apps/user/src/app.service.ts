import { Injectable } from '@nestjs/common';
import {UtilsService} from '@firstrankcoders/shared';

@Injectable()
export class AppService {
  getHello(): string {
    const utilsService = new UtilsService()
    return  utilsService.currentDateTime();
  }
}
