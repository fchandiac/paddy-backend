import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  // Inicializa contexto para aplicar 'synchronize' de TypeORM y crear/actualizar tablas
  const appContext = await NestFactory.createApplicationContext(AppModule);
  console.log('Database schema synchronized: tables created/updated based on entities.');
  await appContext.close();
}

bootstrap().catch((err) => {
  console.error('Error during database sync script:', err);
  process.exit(1);
});
