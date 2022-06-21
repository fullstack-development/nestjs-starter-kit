import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { CR_200, HeaderValue } from '../../core/controller.core';

export type ResponseWithHeaders<T> = {
    body: T;
    headers: Record<string, HeaderValue>;
};

export class SignUpInput {
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(32)
    @MinLength(6)
    password: string;
}

export class SignInInput {
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(32)
    @MinLength(6)
    password: string;
}

export class ConfirmEmailInput {
    @IsString()
    confirmUuid: string;
}

export class CR_SignUpSuccess extends CR_200<never> {}

class AuthToken {
    accessToken: string;

    constructor(token: string) {
        this.accessToken = token;
    }
}

export class CR_SignInSuccess extends CR_200<AuthToken> {
    override body: AuthToken;

    constructor(result: ResponseWithHeaders<AuthToken>) {
        super();
        this.body = result.body;
        this.headers = result.headers;
    }
}

export class CR_ConfirmEmailSuccess extends CR_200<AuthToken> {
    override body: AuthToken;

    constructor(result: ResponseWithHeaders<AuthToken>) {
        super();
        this.body = result.body;
        this.headers = result.headers;
    }
}

export class CR_UpdateRefreshTokenSuccess extends CR_200<AuthToken> {
    override body: AuthToken;

    constructor(result: ResponseWithHeaders<AuthToken>) {
        super();
        this.body = result.body;
        this.headers = result.headers;
    }
}
