import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../../libs/entities/user.entity';
import { Producer } from '../../libs/entities/producer.entity';
import { RiceType } from '../../libs/entities/rice-type.entity';
import { DiscountPercent } from '../../libs/entities/discount-percent.entity';
import { Template } from '../../libs/entities/template.entity';
import { Reception } from '../../libs/entities/reception.entity';
import { Transaction } from '../../libs/entities/transaction.entity';
import { TransactionReference } from '../../libs/entities/transaction-reference.entity';
// Import other entities as needed

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Starting database clear...');

  // Order of deletion matters due to foreign key constraints.
  // Delete child entities first, then parent entities
  const entities = [
    // Start with entities that have fewer dependencies or are at the "end" of a dependency chain
    TransactionReference,
    Transaction,
    Reception,
    DiscountPercent,
    Template,
    // Entities that might be depended upon by others
    User,
    Producer,
    RiceType,
  ];

  try {
    // Disable foreign key checks to avoid issues during deletion
    if (dataSource.options.type === 'mysql' || dataSource.options.type === 'mariadb') {
      await dataSource.query('SET FOREIGN_KEY_CHECKS=0;');
      console.log('Disabled foreign key checks.');
    }

    // Clear each entity without using transactions to avoid rollbacks
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity);
      const tableName = repository.metadata.tableName;
      
      try {
        // Use direct SQL DELETE to ensure data is removed
        await dataSource.query(`DELETE FROM ${tableName};`);
        console.log(`Cleared ${tableName} table.`);

        // Try to reset AUTO_INCREMENT, but continue if it fails
        if (dataSource.options.type === 'mysql' || dataSource.options.type === 'mariadb') {
          try {
            await dataSource.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1001;`);
            console.log(`Reset AUTO_INCREMENT for ${tableName} to 1001.`);
          } catch (autoIncErr) {
            console.warn(`Warning: Could not reset AUTO_INCREMENT for ${tableName}. Continuing.`);
          }
        }
      } catch (error) {
        console.error(`Error clearing ${tableName}:`, error?.message || error);
        // Continue with next table even if this one fails
      }
    }

    // Re-enable foreign key checks
    if (dataSource.options.type === 'mysql' || dataSource.options.type === 'mariadb') {
      await dataSource.query('SET FOREIGN_KEY_CHECKS=1;');
      console.log('Re-enabled foreign key checks.');
    }

    console.log('Database clear process finished successfully.');
  } catch (err) {
    console.error('Error during database clear script:', err);
    throw err;
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error('Error during database clear script:', err);
  process.exit(1);
});
