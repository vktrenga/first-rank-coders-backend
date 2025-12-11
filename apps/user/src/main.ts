import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, ResponseInterceptor, ValidationException } from '@firstrankcoders/shared';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT'); 



  app.useGlobalFilters(new HttpExceptionFilter());
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
  
  // Swagger setup
  if (process.env.NODE_ENV !== 'production') {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('API documentation for authentication service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('Swagger docs available at /api');
  }
  
  console.log(`App running on port: ${port}`);
  console.log('App-level DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
