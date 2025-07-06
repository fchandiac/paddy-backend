import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanAuditLogInvalidValues1736164200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Limpiar registros con valores 'N/A' en ipAddress
    await queryRunner.query(`
      UPDATE audit_log 
      SET ipAddress = NULL 
      WHERE ipAddress = 'N/A' OR ipAddress = '' OR ipAddress = '::1' OR ipAddress = '127.0.0.1'
    `);

    // Limpiar registros con valores 'N/A' en userAgent
    await queryRunner.query(`
      UPDATE audit_log 
      SET userAgent = NULL 
      WHERE userAgent = 'N/A' OR userAgent = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No revertir estos cambios ya que son una limpieza de datos
    // Los valores originales no pueden ser restaurados de manera segura
  }
}
