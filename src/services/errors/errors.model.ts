import { HttpStatus } from '@nestjs/common';
import { BaseError, makeError } from '../../model/errors.model';
import { ErrorEntity } from '../../repositories/errors/errors.entity';

type CannotFindErrorByUuid = BaseError & {
    error: 'cannotFindErrorByUuid';
};
export const cannotFindErrorByUuid = (payload: Pick<ErrorEntity, 'uuid'>) =>
    makeError<CannotFindErrorByUuid>('cannotFindErrorByUuid', HttpStatus.OK, { payload });
