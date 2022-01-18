import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { Transactions } from '../utils/transactions.utils';

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
