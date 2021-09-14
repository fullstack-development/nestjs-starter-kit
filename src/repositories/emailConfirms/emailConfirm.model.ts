import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';

export class CannotFindEmailConfirm extends BaseError {
    constructor() {
        super('cannotFindEmailConfirm', HttpStatus.OK);
    }
}

export class CannotUpdateEmailConfirm extends BaseError {
    constructor() {
        super('cannotUpdateEmailConfirm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class CannotRemoveEmailConfirm extends BaseError {
    constructor() {
        super('cannotRemoveEmailConfirm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
