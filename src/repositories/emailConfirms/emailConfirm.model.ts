import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';

export class CannotFindEmailConfirm extends BaseError {
    constructor() {
        super('cannotFindEmailConfrim', HttpStatus.OK);
    }
}

export class CannotUpdateEmailConfirm extends BaseError {
    constructor() {
        super('cannotUpdateEmailConfrim', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class CannotRemoveEmailConfirm extends BaseError {
    constructor() {
        super('cannotRemoveEmailConfrim', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
