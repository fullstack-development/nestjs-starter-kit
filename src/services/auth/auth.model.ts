import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';
import { UserEntity } from '../../repositories/users/user.entity';

export type TokenPayload = {
    email: string;
};

export type UnknownUserPayload = {
    email: string;
    password: string;
};

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

export class CannotCreateEmailConfirmation extends BaseError {
    constructor(payload: Pick<UserEntity, 'id'> & { createdConfirmId: number }) {
        super('cannotCreateEmailConfirmation', HttpStatus.INTERNAL_SERVER_ERROR, { payload });
    }
}
