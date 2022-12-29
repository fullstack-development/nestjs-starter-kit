import {
    Prisma,
    Repositories,
    RepositoryLibrary,
    RepositoryLibraryProvider,
} from '@lib/repository';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { Injectable, Module } from '@nestjs/common';
import { TransactionsContext } from '../transactions.core';

type RepositoryGetters = {
    readonly [key in Repositories]: Prisma.TransactionClient[key];
};

const repository = <R extends Repositories>(name: R) =>
    RequestContext.get<TransactionsContext>().transactions.Client[name];

@Injectable()
export class DatabaseProvider implements RepositoryGetters {
    constructor(private repository: RepositoryLibraryProvider) {}

    get user() {
        return repository(Repositories.User);
    }

    get refreshToken() {
        return repository(Repositories.RefreshToken);
    }

    get emailConfirm() {
        return repository(Repositories.EmailConfirm);
    }

    /**
     * !!! NO DB TRANSACTION INSTANCE !!!
     */
    get UnsafeRepository() {
        return this.repository.Prisma;
    }
}

@Module({
    imports: [RepositoryLibrary],
    providers: [DatabaseProvider],
    exports: [DatabaseProvider],
})
export class Database {}
