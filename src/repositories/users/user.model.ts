import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';

export class CannotFindUser extends BaseError {
    constructor() {
        super('cannotFindUser', HttpStatus.OK);
    }
}

export class CannotUpdateUser extends BaseError {
    constructor() {
        super('cannotUpdateUser', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class CannotRemoveUser extends BaseError {
    constructor() {
        super('cannotRemoveUser', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
