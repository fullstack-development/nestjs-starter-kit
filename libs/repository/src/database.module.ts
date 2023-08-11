import { AsyncContext, AsyncContextModule } from '@nestjs-steroids/async-context';
import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RepositoryLibrary, RepositoryLibraryProvider } from './repository.lib';
import { Repositories } from './repository.model';

export const TRANSACTIONS_KEY = 'transactions';

const safeGet = (ctx: Map<string, Transactions>, key: string) => {
    try {
        return ctx.get(key);
    } catch {
        return null;
    }
};

export class Transactions {
    private prisma: Prisma.TransactionClient;

    get Client() {
        return this.prisma;
    }

    init(prisma: Prisma.TransactionClient) {
        this.prisma = prisma;
    }
}

export interface IDatabaseModuleOptions {
    isGlobal?: boolean;
}

type RepositoryGetters = {
    readonly [key in Repositories]: Prisma.TransactionClient[key];
};

const repository = <R extends Repositories>(name: R, asyncCtx: Map<string, Transactions>) => {
    const transactions = safeGet(asyncCtx, TRANSACTIONS_KEY);

    if (!transactions) {
        throw new Error('Cannot find Prisma.TransactionClient');
    }

    return transactions.Client[name];
};

@Injectable()
export class DatabaseProvider implements RepositoryGetters {
    constructor(
        private repository: RepositoryLibraryProvider,
        private ctx: AsyncContext<string, Transactions>,
    ) {}

    get user() {
        return repository(Repositories.User, this.ctx);
    }

    get refreshToken() {
        return repository(Repositories.RefreshToken, this.ctx);
    }

    get emailConfirm() {
        return repository(Repositories.EmailConfirm, this.ctx);
    }

    /**
     * !!! NO DB TRANSACTION INSTANCE !!!
     */
    get UnsafeRepository() {
        return this.repository.Prisma;
    }
}

@Module({})
export class DatabaseModule {
    static forRoot(options: IDatabaseModuleOptions = {}): DynamicModule {
        const { isGlobal = true } = options;

        return {
            module: DatabaseModule,
            imports: [AsyncContextModule.forRoot(), RepositoryLibrary],
            providers: [DatabaseProvider],
            exports: [DatabaseProvider],
            global: isGlobal,
        };
    }
}
