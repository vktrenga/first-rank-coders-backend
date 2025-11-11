import { Prisma } from '@prisma/client';
import { AppException } from './app.exception';

export class PrismaExceptionMapper {
  static map(error: any) {
    if (!error || !error.code) return null;

    switch (error.code) {
      case 'P2002':
        return new AppException(
          'Duplicate entry. A record with this value already exists.',
          400,
          error?.meta,
        );
      case 'P2025':
        return new AppException('Record not found', 404, 'P2025');
      default:
        return new AppException(error.message || 'Database error', 500, error.code);
    }
  }
}
