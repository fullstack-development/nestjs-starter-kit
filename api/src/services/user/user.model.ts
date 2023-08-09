import { ConflictError, UnprocessableEntityError } from '@lib/core';

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

export class CannotFindUser extends UnprocessableEntityError<'cannotFindUser'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindUser', { payload });
    }
}

export class CannotFindEmailConfirm extends UnprocessableEntityError<'cannotFindEmailConfirm'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindEmailConfirm', { payload });
    }
}
