import { Module } from '@nestjs/common';
import { ConfigService, ConfigServiceProvider } from '../config/config.service';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseServiceProvider {
    private prisma: PrismaClient;

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
        this.prisma.$connect().then(this.onOpen).catch(this.onError);
    }

    private onError(e: Error) {
        const err = `Database connection error: ${e.message}`;
        // eslint-disable-next-line no-console
        console.error(err);
        throw new Error(err);
    }

    private onOpen() {
        // eslint-disable-next-line no-console
        console.log('Successfully connected to database');
    }
}

@Module({
    imports: [ConfigService],
    providers: [DatabaseServiceProvider],
    exports: [DatabaseServiceProvider],
})
export class DatabaseService {}
