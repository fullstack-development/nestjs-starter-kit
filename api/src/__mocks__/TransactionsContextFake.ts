import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { Transactions } from '../core/transactions.core';

export class TransactionsContextFake extends RequestContext {
    transactions: DeepMocked<Transactions>;

    constructor() {
        super();
        this.transactions = createMock<Transactions>();
    }

    getTransactions() {
        return this.transactions;
    }
}
