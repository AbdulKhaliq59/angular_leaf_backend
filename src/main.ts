import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression = require('compression');

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:4200'),
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );


  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );


  const config = new DocumentBuilder()
    .setTitle('Angular Leaf Classification API')
    .setDescription(
      'API for detecting angular leaf spot disease using machine learning and AI-powered recommendations. ' +
      'Includes JWT authentication with role-based access control.',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management (admin only)')
    .addTag('image-classification', 'ML-powered image classification')
    .addTag('recommendations', 'AI-powered recommendations')
    .addTag('health', 'API health monitoring')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();