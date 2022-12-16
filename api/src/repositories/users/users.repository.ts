import { RequestContext } from '@medibloc/nestjs-request-context';
import { Injectable, Module } from '@nestjs/common';
import { TransactionsContext } from '../../utils/transactions.utils';

@Injectable()
export class UsersRepositoryProvider {
    public get Dao() {
        return RequestContext.get<TransactionsContext>().transactions.Prisma.user;
    }
}

@Module({
    providers: [UsersRepositoryProvider],
    exports: [UsersRepositoryProvider],
})
export class UsersRepository {}
