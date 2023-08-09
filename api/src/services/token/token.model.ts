import { UnprocessableEntityError } from '@lib/core';

export enum UserType {
    USER = 'user',
}

export class CannotFindRefreshToken extends UnprocessableEntityError<'cannotFindRefreshToken'> {
    constructor(payload?: Record<string, unknown>) {
        super('cannotFindRefreshToken', { payload });
    }
}
