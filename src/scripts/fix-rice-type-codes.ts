import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['libs/entities/*.entity.ts'],
  synchronize: false,
});

async function fixRiceTypeCodes() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Eliminar el índice único temporalmente
    console.log('Eliminando índice único del campo code...');
    await AppDataSource.query(`
      DROP INDEX IDX_f01b15516973c455c26658d765 ON rice_type
    `).catch(() => console.log('Índice no existe, continuando...'));

    // Obtener todos los registros de rice_type
    const riceTypes = await AppDataSource.query('SELECT * FROM rice_type');
    console.log(`Encontrados ${riceTypes.length} tipos de arroz`);

    // Asignar códigos únicos a cada registro
    for (let i = 0; i < riceTypes.length; i++) {
      const newCode = 100 + (i + 1); // Códigos empezando desde 101
      await AppDataSource.query(
        'UPDATE rice_type SET code = ? WHERE id = ?',
        [newCode, riceTypes[i].id]
      );
      console.log(`Actualizado rice_type ID ${riceTypes[i].id} con código ${newCode}`);
    }

    // Recrear el índice único
    console.log('Recreando índice único...');
    await AppDataSource.query(`
      CREATE UNIQUE INDEX IDX_f01b15516973c455c26658d765 ON rice_type (code)
    `);

    console.log('✅ Códigos de tipos de arroz corregidos exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixRiceTypeCodes();
