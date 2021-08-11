import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../model/errors.model';

export interface IUserPayload {
    readonly email: string;
    readonly password: string;
}

export class UserAlreadyExist extends BaseError {
    constructor() {
        super('userAlreadyExist', HttpStatus.OK);
    }
}

export class CannotCreateUser extends BaseError {
    constructor(email: string) {
        super('cannotCreateUser', HttpStatus.INTERNAL_SERVER_ERROR, { payload: { email } });
    }
}

export class EmailOrPasswordIncorrect extends BaseError {
    constructor() {
        super('emailOrPasswordIncorrect', HttpStatus.OK);
    }
}
