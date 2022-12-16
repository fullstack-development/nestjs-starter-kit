import { BaseError } from '../../core/errors.core';

export type UserPayload = {
    email: string;
    password: string;
};

export class UserAlreadyExist extends BaseError<'userAlreadyExist'> {
    constructor() {
        super('userAlreadyExist', { userErrorOnly: true });
    }
}

export class EmailOrPasswordIncorrect extends BaseError<'emailOrPasswordIncorrect'> {
    constructor() {
        super('emailOrPasswordIncorrect', { userErrorOnly: true });
    }
}
