import { Catch, ArgumentsHost, BadRequestException, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { BaseResponse } from '../responses/base.response';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const validationErrors = exception.getResponse() as any;

    response.status(400).json(
      BaseResponse.error('Validation failed', validationErrors.message || validationErrors),
    );
  }
}
