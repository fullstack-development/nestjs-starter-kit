import { RequestContext } from '@medibloc/nestjs-request-context';
import { Injectable, Module } from '@nestjs/common';
import { TransactionsContext } from '../../utils/transactions.utils';

@Injectable()
export class ErrorsRepositoryProvider {
    public get Dao() {
        return RequestContext.get<TransactionsContext>().transactions.Prisma.error;
    }
}

@Module({
    providers: [ErrorsRepositoryProvider],
    exports: [ErrorsRepositoryProvider],
})
export class ErrorsRepository {}
