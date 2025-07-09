import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueCodeToRiceType1736428800000 implements MigrationInterface {
  name = 'AddUniqueCodeToRiceType1736428800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero, verificar si la columna code ya existe
    const hasCodeColumn = await queryRunner.hasColumn('rice_type', 'code');
    
    if (!hasCodeColumn) {
      // Si no existe, agregarla sin restricción única primero
      await queryRunner.query(`ALTER TABLE \`rice_type\` ADD \`code\` int NOT NULL DEFAULT 0`);
    }

    // Asignar códigos únicos a los registros existentes
    const existingRiceTypes = await queryRunner.query(`SELECT id FROM \`rice_type\` ORDER BY id`);
    
    for (let i = 0; i < existingRiceTypes.length; i++) {
      const riceType = existingRiceTypes[i];
      const newCode = 100 + i + 1; // Empezar desde 101
      await queryRunner.query(
        `UPDATE \`rice_type\` SET \`code\` = ? WHERE \`id\` = ?`,
        [newCode, riceType.id]
      );
    }

    // Verificar si ya existe el índice único
    const indices = await queryRunner.query(`SHOW INDEX FROM \`rice_type\` WHERE Key_name = 'IDX_f01b15516973c455c26658d765'`);
    
    if (indices.length === 0) {
      // Ahora agregar la restricción única
      await queryRunner.query(`ALTER TABLE \`rice_type\` ADD UNIQUE INDEX \`IDX_f01b15516973c455c26658d765\` (\`code\`)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice único
    await queryRunner.query(`ALTER TABLE \`rice_type\` DROP INDEX \`IDX_f01b15516973c455c26658d765\``);
    
    // Eliminar la columna code
    await queryRunner.query(`ALTER TABLE \`rice_type\` DROP COLUMN \`code\``);
  }
}
