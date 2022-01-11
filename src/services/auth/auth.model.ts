import { ApiProperty } from '@nestjs/swagger';
import { BasicError } from '../../core/errors.core';
import { UserEntity } from '../../repositories/users/user.entity';

export type TokenPayload = {
    email: string;
};

export type UserPayload = {
    email: string;
    password: string;
};

export class EmailNotConfirmed extends BasicError<'emailNotConfirmed'> {
    constructor() {
        super('emailNotConfirmed', { userErrorOnly: true });
    }
}

export class ConfirmationNotFound extends BasicError<'confirmationNotFound'> {
    constructor() {
        super('confirmationNotFound', { userErrorOnly: true });
    }
}

export class EmailAlreadyConfirmed extends BasicError<'emailAlreadyConfirmed'> {
    constructor() {
        super('emailAlreadyConfirmed', { userErrorOnly: true });
    }
}

export class CannotCreateEmailConfirmation extends BasicError<'cannotCreateEmailConfirmation'> {
    constructor(payload: Pick<UserEntity, 'id'> & { createdConfirmId: number }) {
        super('cannotCreateEmailConfirmation', { payload });
    }
}

export class CannotSendEmailConfirmation extends BasicError<'cannotSendEmailConfirmation'> {
    constructor(payload: { sourceError: BasicError<string> }) {
        super('cannotSendEmailConfirmation', { payload });
    }
}

export class CannotCreateRefreshToken extends BasicError<'cannotCreateRefreshToken'> {
    constructor(payload: { email: string }) {
        super('cannotCreateRefreshToken', { payload });
    }
}

export class AuthToken {
    @ApiProperty()
    accessToken: string;

    constructor(token: string) {
        this.accessToken = token;
    }
}
