import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { BasicError, isError } from '../../core/errors.core';
import { ErrorEntity } from '../../repositories/errors/errors.entity';
import {
    ErrorsRepository,
    ErrorsRepositoryProvider,
} from '../../repositories/errors/errors.repository';
import { UserEntity } from '../../repositories/users/user.entity';
import { uuid } from '../../utils';
import { CannotFindErrorByUuid, CannotFindNewlyCreatedError } from './errors.model';

@Injectable()
export class ErrorsServiceProvider {
    constructor(private errorsRepository: ErrorsRepositoryProvider) {}

    async handleError<T extends string>(fail: BasicError<T>, userId?: UserEntity['id']) {
        const errorId = await this.errorsRepository.create({
            uuid: uuid(),
            userId,
            error: fail.error,
            stackTrace: fail.stackTrace,
            message: fail.message,
            payload: fail.payload && JSON.stringify(fail.payload),
        });

        const errorResult = await this.errorsRepository.findOne({ id: errorId });
        if (isError(errorResult)) {
            return new CannotFindNewlyCreatedError(fail);
        }
        return { uuid: errorResult.uuid };
    }

    async getErrorByUuid(filter: Pick<ErrorEntity, 'uuid'>) {
        const errorResult = await this.errorsRepository.findOne(filter);
        if (isError(errorResult)) {
            return new CannotFindErrorByUuid(filter);
        }
        return errorResult;
    }
}

@Module({
    imports: [ErrorsRepository],
    providers: [ErrorsServiceProvider],
    exports: [ErrorsServiceProvider],
})
export class ErrorsService {}
