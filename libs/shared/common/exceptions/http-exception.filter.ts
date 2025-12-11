import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload: any = exception.getResponse();

      return response.status(statusCode).json({
        status: false,
        message: payload.message || 'Error occurred',
        errors: payload.errors || null,
        errorCode: payload.errorCode || null,
      });
    }

    // fallback for other unhandled errors
    return response.status(500).json({
      status: false,
      message: 'Internal Server Error',
      errors: null,
      errorCode: 'SERVER_ERROR',
    });
  }
}
