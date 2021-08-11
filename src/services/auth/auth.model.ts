import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';

export interface TokenPayload {
    readonly email: string;
}

export interface IUnknownUserPayload {
    readonly email: string;
    readonly password: string;
}

export class EmailNotConfirmed extends BaseError {
    constructor() {
        super('emailNotConfirmed', HttpStatus.OK);
    }
}

export class ConfirmationNotFound extends BaseError {
    constructor() {
        super('confirmationNotFound', HttpStatus.OK);
    }
}

export class EmailAlreadyConfirmed extends BaseError {
    constructor() {
        super('emailAlreadyConfirmed', HttpStatus.OK);
    }
}
