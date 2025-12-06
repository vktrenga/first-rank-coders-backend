import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import {
  BaseResponse,
  AppException,
  PrismaService,
  AppLogger,
  ResponseInterceptor,
  ValidationException,
  AllExceptionsFilter,
  JwtAuthGuard
} from '@firstrankcoders/shared';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // Use improved AppExceptionFilter for global exception handling
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      forbidNonWhitelisted: false,
      transform: true, // Auto-convert types
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints ?? {}),
        }));

        throw new ValidationException(formattedErrors);
      },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Organization Service API')
      .setDescription('API documentation for organization service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('Swagger docs available at /api');
  }


  console.log(`App running on port: ${port}`);
  await app.listen(configService.get('PORT') ?? 3000);
}

bootstrap();
