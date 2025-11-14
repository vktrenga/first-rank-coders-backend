import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for My App')
    .setVersion('1.0')
    .addBearerAuth() // if you use JWT auth
    .build();

  // Create Swagger Document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('api-docs', app, document);
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT'); 
  console.log(`App running on port: ${port}`);
  console.log('App-level DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
