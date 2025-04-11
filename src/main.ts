import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from 'libs/config';

async function bootstrap() {
  const logger = new Logger('App');
  const app = await NestFactory.create(AppModule);
  const port = envs.gateway.port;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS para aceptar desde cualquier origen
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(port);
  logger.log(`BackendApp started at http://localhost:${port}`);
}

bootstrap();
