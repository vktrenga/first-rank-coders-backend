import { Injectable } from '@nestjs/common';
import * as  firstrankcoders from '@firstrankcoders/shared';
@Injectable()
export class AppService {
  getHello(): string {
    return  firstrankcoders.greet("User Service");;
  }
}
