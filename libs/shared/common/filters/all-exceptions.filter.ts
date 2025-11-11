import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseResponse } from '../responses/base.response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message || 'Internal Server Error' };

    response.status(status).json(
      BaseResponse.error(
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any).message || 'Something went wrong',
        {
          path: request.url,
          timestamp: new Date().toISOString(),
          ...(typeof errorResponse === 'object' ? errorResponse : {}),
        },
      ),
    );
  }
}
