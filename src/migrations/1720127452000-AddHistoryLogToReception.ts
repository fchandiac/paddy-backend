import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHistoryLogToReception1720127452000 implements MigrationInterface {
    name = 'AddHistoryLogToReception1720127452000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // En MySQL, la sintaxis es diferente
        await queryRunner.query(`ALTER TABLE \`reception\` ADD \`historyLog\` json NULL`);
        // Inicializar los registros existentes con un array vacío
        await queryRunner.query(`UPDATE \`reception\` SET \`historyLog\` = '[]' WHERE \`historyLog\` IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reception\` DROP COLUMN \`historyLog\``);
    }
}
