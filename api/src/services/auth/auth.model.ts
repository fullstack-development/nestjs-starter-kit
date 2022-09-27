import { BaseError } from '../../core/errors.core';

export type TokenPayload = {
    email: string;
};

export type UserPayload = {
    email: string;
    password: string;
};

export class EmailNotConfirmed extends BaseError<'emailNotConfirmed'> {
    constructor() {
        super('emailNotConfirmed', { userErrorOnly: true });
    }
}

export class EmailAlreadyConfirmed extends BaseError<'emailAlreadyConfirmed'> {
    constructor() {
        super('emailAlreadyConfirmed', { userErrorOnly: true });
    }
}

export class CannotSendEmailConfirmation extends BaseError<'cannotSendEmailConfirmation'> {
    constructor(payload: { sourceError: BaseError<string> }) {
        super('cannotSendEmailConfirmation', { payload });
    }
}

export class AuthToken {
    accessToken: string;

    constructor(token: string) {
        this.accessToken = token;
    }
}
