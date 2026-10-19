import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestLogInterceptor } from './modules/request-log/request-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));

  // Global Request Logging Interceptor
  try {
    const logInterceptor = app.get(RequestLogInterceptor);
    app.useGlobalInterceptors(logInterceptor);
  } catch (err) {
    console.warn('Could not bind global RequestLogInterceptor:', err);
  }

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 EPC Suite API listening on http://localhost:${port}`);
  console.log(`📋 API Logbook available at http://localhost:${port}/api/admin/request-log`);
}
bootstrap();
