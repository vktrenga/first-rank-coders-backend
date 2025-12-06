import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST, errors?: any, errorCode?: any) {
    super(
      {
        success: false,
        message,
        errors,
        errorCode: errorCode || null,
      },
      status,
    );
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string, details?: any) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, details);
  }
}

export class ValidationException extends AppException {
  constructor(errors: any) {
    super('Validation failed', HttpStatus.BAD_REQUEST, errors);
  }
}
