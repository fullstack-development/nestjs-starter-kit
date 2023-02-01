import { BaseError, ConflictError, UnprocessableEntityError } from '../../core/errors.core';

export type TokenPayload = {
    email: string;
};

export type UserPayload = {
    email: string;
    password: string;
};

export class EmailNotConfirmed extends UnprocessableEntityError<'emailNotConfirmed'> {
    constructor() {
        super('emailNotConfirmed');
    }
}

export class EmailAlreadyConfirmed extends ConflictError<'emailAlreadyConfirmed'> {
    constructor() {
        super('emailAlreadyConfirmed');
    }
}

// eslint-disable-next-line max-len
export class CannotSendEmailConfirmation extends UnprocessableEntityError<'cannotSendEmailConfirmation'> {
    constructor(payload: { sourceError: BaseError<string> }) {
        super('cannotSendEmailConfirmation', { payload });
    }
}
