import { RequestContext } from '@medibloc/nestjs-request-context';
import { Prisma, PrismaClient, Repositories } from '@modules/repository';
import { Injectable, Logger, Module } from '@nestjs/common';
import { Config, ConfigProvider } from '../config/config.core';
import { TransactionsContext } from '../transactions.core';

type RepositoryGetters = {
    readonly [key in Repositories]: Prisma.TransactionClient[key];
};

const repository = <R extends Repositories>(name: R) =>
    RequestContext.get<TransactionsContext>().transactions.Prisma[name];

@Injectable()
export class DatabaseProvider implements RepositoryGetters {
    get user() {
        return repository(Repositories.User);
    }

    get refreshToken() {
        return repository(Repositories.RefreshToken);
    }

    get emailConfirm() {
        return repository(Repositories.EmailConfirm);
    }

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
    imports: [Config],
    providers: [DatabaseProvider],
    exports: [DatabaseProvider],
})
export class Database {}
