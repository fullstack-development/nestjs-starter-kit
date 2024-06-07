import { BaseError, objToString } from '@lib/core';

export class EmailAlreadyConfirmed extends BaseError<'emailAlreadyConfirmed'> {
    constructor(userId: number) {
        super('emailAlreadyConfirmed', { message: objToString({ userId }) });
    }
}

export class CannotFindEmailConfirm extends BaseError<'cannotFindEmailConfirm'> {
    constructor() {
        super('cannotFindEmailConfirm');
    }
}
