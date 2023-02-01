import { UnprocessableEntityError } from '../errors.core';

export class CannotFindEmailConfirm extends UnprocessableEntityError<'cannotFindEmailConfirm'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindEmailConfirm', { payload });
    }
}

export class CannotFindUser extends UnprocessableEntityError<'cannotFindUser'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindUser', { payload });
    }
}

export class CannotFindRefreshToken extends UnprocessableEntityError<'cannotFindRefreshToken'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindRefreshToken', { payload });
    }
}
