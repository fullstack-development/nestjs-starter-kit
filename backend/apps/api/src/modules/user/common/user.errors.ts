import { BaseError, objToString } from '@lib/core';

export class UserAlreadyExists extends BaseError<'userAlreadyExists'> {
    constructor(email: string) {
        super('userAlreadyExists', { message: objToString({ email }) });
    }
}
