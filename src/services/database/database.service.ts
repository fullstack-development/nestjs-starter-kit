import { Module } from '@nestjs/common';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger, LoggerProvider } from '../../core/logger.core';

@Injectable()
export class DatabaseServiceProvider {
    private readonly prisma: PrismaClient;

    /**
     * !!! NO DB TRANSACTION INSTANCE !!!
     */
    public get Prisma() {
        return this.prisma;
    }

    constructor(
        // import the config to make sure it is initialized first
        private cfg: ConfigServiceProvider,
        private logger: LoggerProvider,
    ) {
        this.prisma = new PrismaClient();
        this.prisma
            .$connect()
            .then(() => this.onOpen())
            .catch((e) => this.onError(e));
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
