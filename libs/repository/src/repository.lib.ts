import { Injectable, Logger, Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RepositoryLibraryProvider implements OnModuleInit {
    private prisma = new PrismaClient();
    private readonly logger = new Logger(RepositoryLibraryProvider.name);

    public get Prisma() {
        return this.prisma;
    }

    async onModuleInit() {
        if (!process.env['DATABASE_URL']) {
            throw new Error('Cannot find DATABASE_URL environment variable');
        }

        try {
            await this.prisma.$connect();
            this.logger.log('Successfully connected to database');
        } catch (e) {
            const err = `Database connection error: ${e.message}`;
            this.logger.error(err);
            throw new Error(err);
        }
    }
}

@Module({
    providers: [RepositoryLibraryProvider],
    exports: [RepositoryLibraryProvider],
})
export class RepositoryLibrary {}
