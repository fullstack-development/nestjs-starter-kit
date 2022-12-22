import { RequestContext } from '@medibloc/nestjs-request-context';
import { Prisma, PrismaClient, Repositories } from '@modules/repository';
import { Injectable, Logger, Module } from '@nestjs/common';
import { ConfigProvider } from '../config/config.core';
import { TransactionsContext } from '../transactions.core';

type RepositoryGetters = {
    readonly [key in Repositories]: Prisma.TransactionClient[key];
};

function Repository<R extends Repositories>(name: R) {
    return function (target: unknown, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            get: () => RequestContext.get<TransactionsContext>().transactions.Prisma[name],
        });
    };
}

@Injectable()
export class DatabaseProvider implements RepositoryGetters {
    @Repository(Repositories.User)
    readonly user: Prisma.TransactionClient['user'];

    @Repository(Repositories.RefreshToken)
    readonly refreshToken: Prisma.TransactionClient['refreshToken'];

    @Repository(Repositories.EmailConfirm)
    readonly emailConfirm: Prisma.TransactionClient['emailConfirm'];

    private readonly prisma = new PrismaClient();
    private readonly logger = new Logger(DatabaseProvider.name);

    private isInitialized = false;

    /**
     * !!! NO DB TRANSACTION INSTANCE !!!
     */
    public get Prisma() {
        return this.prisma;
    }

    constructor(
        // import the config to make sure it is initialized first
        private cfg: ConfigProvider,
    ) {}

    async initialize() {
        if (this.isInitialized) return;

        try {
            await this.prisma.$connect();
            this.logger.log('Successfully connected to database');
            this.isInitialized = true;
        } catch (e) {
            const err = `Database connection error: ${e.message}`;
            this.logger.error(err);
            throw new Error(err);
        }
    }
}

@Module({
    providers: [DatabaseProvider],
    exports: [DatabaseProvider],
})
export class Database {}
