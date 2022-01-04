import { BasicError } from '../../core/errors.core';

export class CannotFindEmailConfirm extends BasicError<'cannotFindEmailConfirm'> {
    constructor() {
        super('cannotFindEmailConfirm', { userErrorOnly: true });
    }
}

export class CannotUpdateEmailConfirm extends BasicError<'cannotUpdateEmailConfirm'> {
    constructor() {
        super('cannotUpdateEmailConfirm');
    }
}

export class CannotRemoveEmailConfirm extends BasicError<'cannotRemoveEmailConfirm'> {
    constructor() {
        super('cannotRemoveEmailConfirm');
    }
}
