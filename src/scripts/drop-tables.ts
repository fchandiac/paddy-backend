import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const dataSource = appContext.get(DataSource);

  console.log('Disabling foreign key checks...');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  // Obtener todos los nombres de tabla de las entidades registradas
  const tableNames = dataSource.entityMetadatas.map(meta => meta.tableName);
  for (const tableName of tableNames) {
    try {
      console.log(`Dropping table if exists: ${tableName}`);
      await dataSource.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    } catch (err) {
      console.error(`Error dropping table ${tableName}:`, err.message || err);
    }
  }

  console.log('Re-enabling foreign key checks...');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('All tables dropped successfully.');
  await appContext.close();
}

bootstrap().catch(err => {
  console.error('Error running drop-tables script:', err);
  process.exit(1);
});
