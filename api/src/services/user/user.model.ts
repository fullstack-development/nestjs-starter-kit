import { ConflictError, UnprocessableEntityError } from '../../core/errors.core';

export type UserPayload = {
    email: string;
    password: string;
};

export class UserAlreadyExist extends ConflictError<'userAlreadyExist'> {
    constructor() {
        super('userAlreadyExist');
    }
}

export class EmailOrPasswordIncorrect extends UnprocessableEntityError<'emailOrPasswordIncorrect'> {
    constructor() {
        super('emailOrPasswordIncorrect');
    }
}
