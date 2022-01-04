import { BasicError } from '../../core/errors.core';

export type UserPayload = {
    email: string;
    password: string;
};

export class UserAlreadyExist extends BasicError<'userAlreadyExist'> {
    constructor() {
        super('userAlreadyExist', { userErrorOnly: true });
    }
}

export class CannotCreateUser extends BasicError<'cannotCreateUser'> {
    constructor(email: string) {
        super('cannotCreateUser', { payload: { email } });
    }
}

export class EmailOrPasswordIncorrect extends BasicError<'emailOrPasswordIncorrect'> {
    constructor() {
        super('emailOrPasswordIncorrect', { userErrorOnly: true });
    }
}
