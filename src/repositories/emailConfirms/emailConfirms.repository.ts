import { RequestContext } from '@medibloc/nestjs-request-context';
import { Injectable, Module } from '@nestjs/common';
import { TransactionsContext } from '../../utils/transactions.utils';

@Injectable()
export class EmailConfirmsRepositoryProvider {
    public get Dao() {
        return RequestContext.get<TransactionsContext>().transactions.Prisma.emailConfirm;
    }
}

@Module({
    providers: [EmailConfirmsRepositoryProvider],
    exports: [EmailConfirmsRepositoryProvider],
})
export class EmailConfirmsRepository {}
