import { BasicError } from '../../core/errors.core';

export class CannotFindUser extends BasicError<'cannotFindUser'> {
    constructor() {
        super('cannotFindUser', { userErrorOnly: true });
    }
}

export class CannotUpdateUser extends BasicError<'cannotUpdateUser'> {
    constructor() {
        super('cannotUpdateUser');
    }
}

export class CannotRemoveUser extends BasicError<'cannotRemoveUser'> {
    constructor() {
        super('cannotRemoveUser');
    }
}
