import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsService } from './metrics/metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Pipes globais
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor de logging e métricas HTTP
  const loggingInterceptor = new LoggingInterceptor();
  const metricsService = app.get(MetricsService);
  loggingInterceptor.setMetricsService(metricsService);
  app.useGlobalInterceptors(loggingInterceptor);

  // CORS
  app.enableCors({ origin: process.env.WEB_URL || 'http://localhost:3000' });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Carteira API')
    .setDescription('API de carteira financeira — Grupo Adriano Cobuccio')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Swagger em  http://localhost:${port}/docs`);
  console.log(`📊 Métricas (Prom) em  http://localhost:${port}/metrics`);
}

bootstrap();
