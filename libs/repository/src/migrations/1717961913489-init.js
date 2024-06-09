const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class Init1717961913489 {
    name = 'Init1717961913489'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "hash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "emailConfirmed" boolean NOT NULL DEFAULT false, "refreshTokenHash" character varying, "emailConfirmToken" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
