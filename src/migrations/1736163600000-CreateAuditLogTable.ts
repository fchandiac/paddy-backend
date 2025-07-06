import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogTable1736163600000 implements MigrationInterface {
    name = 'CreateAuditLogTable1736163600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`audit_log\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NULL,
                \`ipAddress\` varchar(45) NULL,
                \`userAgent\` varchar(500) NULL,
                \`action\` enum('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT') NOT NULL,
                \`entityType\` enum('USER', 'PRODUCER', 'RECEPTION', 'RICE_TYPE', 'TEMPLATE', 'TRANSACTION', 'DISCOUNT_PERCENT', 'SYSTEM') NOT NULL,
                \`entityId\` int NULL,
                \`description\` varchar(255) NOT NULL,
                \`metadata\` json NULL,
                \`oldValues\` json NULL,
                \`newValues\` json NULL,
                \`success\` tinyint NOT NULL DEFAULT 1,
                \`errorMessage\` varchar(500) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_audit_user_date\` (\`userId\`, \`createdAt\`),
                INDEX \`IDX_audit_entity\` (\`entityType\`, \`entityId\`),
                INDEX \`IDX_audit_action_date\` (\`action\`, \`createdAt\`),
                CONSTRAINT \`FK_audit_log_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`audit_log\``);
    }
}
