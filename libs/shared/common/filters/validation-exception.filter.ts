import { Catch, ArgumentsHost, BadRequestException, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const validationErrors = exception.getResponse() as any;
    response.status(400).json({
      status: false,
      message: 'Validation failed',
      errors: validationErrors.errors || validationErrors,
    });
   
  }
}
