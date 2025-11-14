import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

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
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
