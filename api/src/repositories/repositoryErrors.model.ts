import { BaseError } from '../core/errors.core';

export class CannotFindEmailConfirm extends BaseError<'cannotFindEmailConfirm'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindEmailConfirm', { userErrorOnly: true, payload });
    }
}

export class CannotFindUser extends BaseError<'cannotFindUser'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindUser', { userErrorOnly: true, payload });
    }
}

export class CannotFindRefreshToken extends BaseError<'cannotFindRefreshToken'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindRefreshToken', { userErrorOnly: true, payload });
    }
}
