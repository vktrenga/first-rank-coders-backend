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

    // Log the error for debugging
    // You can inject a logger here if needed
    // console.error(exception);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception?.message || 'Internal Server Error' };

    // If errorResponse is a string, wrap it in an object
    if (typeof errorResponse === 'string') {
      errorResponse = { message: errorResponse };
    }

    // Extract errorCode if present
    const errorCode = errorResponse.errorCode || exception?.errorCode;

    response.status(status).json(
      BaseResponse.error(
        errorResponse.message || 'Something went wrong',
        {
          ...errorResponse,
        },
        errorCode
      ),
    );
  }
}
