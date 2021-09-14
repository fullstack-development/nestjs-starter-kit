import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';
import { resultFail, ResultFail, resultSuccess } from '../../model/result.model';
import { ErrorEntity } from '../../repositories/errors/errors.entity';
import {
    ErrorsRepository,
    ErrorsRepositoryProvider,
} from '../../repositories/errors/errors.repository';
import { UserEntity } from '../../repositories/users/user.entity';
import { uuid } from '../../utils';
import { CannotFindErrorByUuid } from './errors.model';

@Injectable()
export class ErrorsServiceProvider {
    constructor(private errorsRepository: ErrorsRepositoryProvider) {}

    async handleError<E extends BaseError>(fail: ResultFail<E>, userId: UserEntity['id']) {
        const errorId = await this.errorsRepository.create({
            uuid: uuid(),
            userId,
            error: fail.error.error,
            stackTrace: fail.error.stackTrace,
            message: fail.error.extra?.message,
            payload: this.encodePayload(fail.error.extra?.payload),
        });

        const errorResult = await this.errorsRepository.findOne({ id: errorId });
        if (!errorResult.success) {
            throw new Error('Cannot find the newly created error!');
        }
        const error = errorResult.data;

        return error.uuid;
    }

    async getErrorByUuid(filter: Pick<ErrorEntity, 'uuid'>) {
        const errorResult = await this.errorsRepository.findOne(filter);
        if (!errorResult.success) {
            return resultFail(new CannotFindErrorByUuid(filter));
        }

        return resultSuccess(errorResult.data);
    }

    decodePayload(payload: Buffer): string {
        return payload.toString('utf8');
    }

    private encodePayload(payload: unknown | undefined): Buffer | undefined {
        if (!payload) {
            return undefined;
        }

        if (typeof payload === 'object') {
            return Buffer.from(JSON.stringify(payload), 'utf8');
        }

        return Buffer.from(String(payload), 'utf8');
    }
}

@Module({
    imports: [ErrorsRepository],
    providers: [ErrorsServiceProvider],
    exports: [ErrorsServiceProvider],
})
export class ErrorsService {}
