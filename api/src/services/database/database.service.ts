import { Logger, Module } from '@nestjs/common';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseServiceProvider {
    private readonly prisma: PrismaClient;
    private readonly logger = new Logger(DatabaseServiceProvider.name);

    /**
     * !!! NO DB TRANSACTION INSTANCE !!!
     */
    public get Prisma() {
        return this.prisma;
    }

    constructor(
        // import the config to make sure it is initialized first
        private cfg: ConfigServiceProvider,
    ) {
        this.prisma = new PrismaClient();
    }

    async init() {
        try {
            await this.prisma.$connect();
            this.onOpen();
        } catch (e) {
            this.onError(e);
        }
    }

    private onError(e: Error) {
        const err = `Database connection error: ${e.message}`;
        this.logger.error(err);
        throw new Error(err);
    }

    private onOpen() {
        this.logger.log('Successfully connected to database');
    }
}

@Module({
    imports: [ConfigService, Logger],
    providers: [DatabaseServiceProvider],
    exports: [DatabaseServiceProvider],
})
export class DatabaseService {}
