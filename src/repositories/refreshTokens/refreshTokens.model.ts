import { BasicError } from '../../core/errors.core';

export class CannotFindRefreshToken extends BasicError<'cannotFindRefreshToken'> {
    constructor() {
        super('cannotFindRefreshToken', { userErrorOnly: true });
    }
}

export class CannotUpdateRefreshToken extends BasicError<'cannotUpdateRefreshToken'> {
    constructor() {
        super('cannotUpdateRefreshToken');
    }
}

export class CannotRemoveRefreshToken extends BasicError<'cannotRemoveRefreshToken'> {
    constructor() {
        super('cannotRemoveRefreshToken');
    }
}
