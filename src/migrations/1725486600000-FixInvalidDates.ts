import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInvalidDates1725486600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Actualizar fechas inválidas '0000-00-00' a NULL en la tabla transaction
    await queryRunner.query(`
      UPDATE transaction 
      SET date = NULL 
      WHERE date = '0000-00-00'
    `);

    // Actualizar fechas inválidas '0000-00-00' en la tabla season si existen
    await queryRunner.query(`
      UPDATE season 
      SET startDate = NULL 
      WHERE startDate = '0000-00-00'
    `);

    await queryRunner.query(`
      UPDATE season 
      SET endDate = NULL 
      WHERE endDate = '0000-00-00'
    `);

    // Actualizar cualquier otra tabla que pueda tener fechas inválidas
    await queryRunner.query(`
      UPDATE reception 
      SET date = NULL 
      WHERE date = '0000-00-00'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No hay operación de rollback para esta migración
    // ya que restaurar fechas inválidas no tiene sentido
  }
}
