import { RequestContext } from '@medibloc/nestjs-request-context';
import { QueryRunner, getConnection, Connection } from 'typeorm';

export class TransactionsContext extends RequestContext {
    transactions: Transactions;

    constructor() {
        super();
        this.transactions = new Transactions();
    }
}

export class Transactions {
    private connection: Connection;
    private queryRunner: QueryRunner;

    get Manager() {
        return this.queryRunner.manager;
    }

    get QueryRunner() {
        return this.queryRunner;
    }

    constructor() {
        this.connection = getConnection();
    }

    async start() {
        this.queryRunner = this.connection.createQueryRunner();
        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();
    }

    async abort() {
        return await this.queryRunner.rollbackTransaction();
    }

    async commit() {
        return await this.queryRunner.commitTransaction();
    }

    async stop() {
        return await this.queryRunner.release();
    }
}
