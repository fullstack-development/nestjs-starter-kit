import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';
import { ErrorEntity } from '../../repositories/errors/errors.entity';

export class CannotFindErrorByUuid extends BaseError {
    constructor(payload: Pick<ErrorEntity, 'uuid'>) {
        super('cannotFindErrorByUuid', HttpStatus.OK, { payload });
    }
}
