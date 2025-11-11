
import { Injectable } from '@nestjs/common';
import {UtilsService} from '@firstrankcoders/shared';
@Injectable()
export class AppService {
  constructor (private readonly utilsService: UtilsService){ 
  }
  getHello(): string {
    return  " Contest Service "+ this.utilsService.currentDateTime();
  }
}
