import { BaseError } from '@lib/core';

export class EmailOrPasswordIncorrect extends BaseError<'emailOrPasswordIncorrect'> {
    constructor() {
        super('emailOrPasswordIncorrect');
    }
}
