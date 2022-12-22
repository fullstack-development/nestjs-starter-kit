import { RequestContext } from '@medibloc/nestjs-request-context';
import { Prisma } from '@modules/repository';

export class Transactions {
    private prisma: Prisma.TransactionClient;

    get Prisma() {
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
