import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';

export class CannotFindError extends BaseError {
    constructor() {
        super('cannotFindError', HttpStatus.OK);
    }
}

export class CannotUpdateError extends BaseError {
    constructor() {
        super('cannotUpdateError', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class CannotRemoveError extends BaseError {
    constructor() {
        super('cannotRemoveError', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
