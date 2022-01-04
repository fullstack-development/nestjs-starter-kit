import { BasicError } from '../../core/errors.core';

export class CannotFindError extends BasicError<'cannotFindError'> {
    constructor() {
        super('cannotFindError', { userErrorOnly: true });
    }
}

export class CannotUpdateError extends BasicError<'cannotUpdateError'> {
    constructor() {
        super('cannotUpdateError');
    }
}

export class CannotRemoveError extends BasicError<'cannotRemoveError'> {
    constructor() {
        super('cannotRemoveError');
    }
}
