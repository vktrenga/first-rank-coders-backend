import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
  private customContext: string = 'AppLogger';

  setContext(context: string) {
    this.customContext = context;
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, this.customContext, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(message, this.customContext, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, this.customContext, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, this.customContext, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, this.customContext, ...optionalParams);
  }
}
