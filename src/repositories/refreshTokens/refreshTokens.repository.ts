import { Injectable, Module } from '@nestjs/common';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { TransactionsContext } from '../../utils/transactions.utils';

@Injectable()
export class RefreshTokensRepositoryProvider {
    public get Dao() {
        return RequestContext.get<TransactionsContext>().transactions.Prisma.refreshToken;
    }
}

@Module({
    providers: [RefreshTokensRepositoryProvider],
    exports: [RefreshTokensRepositoryProvider],
})
export class RefreshTokensRepository {}
