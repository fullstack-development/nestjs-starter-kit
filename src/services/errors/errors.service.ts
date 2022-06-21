import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Error, User } from '@prisma/client';
import { BaseError } from '../../core/errors.core';
import {
    ErrorsRepository,
    ErrorsRepositoryProvider,
} from '../../repositories/errors/errors.repository';
import { CannotFindError } from '../../repositories/repositoryErrors.model';
import { uuid } from '../../utils';
import { DatabaseService, DatabaseServiceProvider } from '../database/database.service';

@Injectable()
export class ErrorsServiceProvider {
    constructor(private errors: ErrorsRepositoryProvider, private db: DatabaseServiceProvider) {}

    async handleError<T extends string>(fail: BaseError<T>, userId?: User['id']) {
        const error = await this.db.Prisma.error.create({
            data: {
                uuid: uuid(),
                userId: userId || -1,
                error: fail.error,
                stack: fail.stackTrace || '',
                message: fail.message,
                payload: fail.payload && JSON.stringify(fail.payload),
            },
        });
        return { uuid: error.uuid };
    }

    async getErrorByUuid(where: Pick<Error, 'uuid'>) {
        const error = await this.errors.Dao.findFirst({ where });
        if (error === null) {
            return new CannotFindError();
        }
        return error;
    }
}

@Module({
    imports: [ErrorsRepository, DatabaseService],
    providers: [ErrorsServiceProvider],
    exports: [ErrorsServiceProvider],
})
export class ErrorsService {}
