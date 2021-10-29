import { BasicError } from '../../core/errors.core';
import { ErrorEntity } from '../../repositories/errors/errors.entity';

export class CannotFindErrorByUuid extends BasicError<'cannotFindErrorByUuid'> {
    constructor(payload: Pick<ErrorEntity, 'uuid'>) {
        super('cannotFindErrorByUuid', { userErrorOnly: true, payload });
    }
}

export class CannotFindNewlyCreatedError extends BasicError<'cannotFindNewlyCreatedError'> {
    constructor(coreError: BasicError<string>) {
        super('cannotFindNewlyCreatedError', { payload: { coreError } });
    }
}
