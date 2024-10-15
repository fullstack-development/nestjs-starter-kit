import { BaseError, objToString } from '@lib/core';

export class EmailAlreadyConfirmed extends BaseError<'emailAlreadyConfirmed'> {
    constructor(userId: number) {
        super('emailAlreadyConfirmed', { message: objToString({ userId }) });
    }
}

export class EmailNotConfirmed extends BaseError<'emailNotConfirmed'> {
    constructor(email: string) {
        super('emailNotConfirmed', { message: objToString({ email }) });
    }
}

export class CannotFindEmailConfirm extends BaseError<'cannotFindEmailConfirm'> {
    constructor() {
        super('cannotFindEmailConfirm');
    }
}

export class EmailOrPasswordIncorrect extends BaseError<'emailOrPasswordIncorrect'> {
    constructor(email: string) {
        super('emailOrPasswordIncorrect', { message: objToString(email) });
    }
}
