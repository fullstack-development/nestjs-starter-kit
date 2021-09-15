import { RequestContext } from '@medibloc/nestjs-request-context';
import { QueryRunner, getConnection, Connection, EntityManager } from 'typeorm';

export class TransactionsContext extends RequestContext {
    transactions: Transactions;

    constructor() {
        super();
        this.transactions = new Transactions();
    }
}

export class Transactions {
    private connection: Connection;
    private manager: EntityManager;
    private queryRunner: QueryRunner;

    get Manager() {
        if (!this.manager) {
            throw new Error('Manager should be provided');
        }
        return this.manager;
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

    setManager(manager: EntityManager) {
        this.manager = manager;
    }
}
