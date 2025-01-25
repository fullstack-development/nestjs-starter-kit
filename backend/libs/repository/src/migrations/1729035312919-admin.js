const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class Admin1729035312919 {
    name = 'Admin1729035312919'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "admin" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "hash" character varying NOT NULL, "crated_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "admin"`);
    }
}
