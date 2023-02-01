import { Prisma } from '@lib/repository';
import { RequestContext } from '@medibloc/nestjs-request-context';

export class Transactions {
    private prisma: Prisma.TransactionClient;

    get Client() {
        return this.prisma;
    }

    async init(prisma: Prisma.TransactionClient) {
        this.prisma = prisma;
    }
}

export class TransactionsContext extends RequestContext {
    transactions: Transactions;

    constructor() {
        super();
        this.transactions = new Transactions();
    }
}
