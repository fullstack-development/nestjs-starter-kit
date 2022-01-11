import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { CR_200, CR_200_Fail, HeaderValue } from '../../core/controller.core';

export type ResponseWithHeaders<T> = {
    body: T;
    headers: Record<string, HeaderValue>;
};

export class SignUpInput {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MaxLength(32)
    @MinLength(6)
    password: string;
}

export class SignInInput {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MaxLength(32)
    @MinLength(6)
    password: string;
}

export class ConfirmEmailInput {
    @ApiProperty()
    @IsString()
    confirmUuid: string;
}

export class CR_SignUpSuccess extends CR_200<never> {}

class AuthToken {
    @ApiProperty()
    accessToken: string;

    constructor(token: string) {
        this.accessToken = token;
    }
}

export class CR_SignInSuccess extends CR_200<AuthToken> {
    @ApiProperty({ type: AuthToken })
    override body: AuthToken;

    constructor(result: ResponseWithHeaders<AuthToken>) {
        super();
        this.body = result.body;
        this.headers = result.headers;
    }
}

export class CR_ConfirmEmailSuccess extends CR_200<AuthToken> {
    @ApiProperty({ type: AuthToken })
    override body: AuthToken;

    constructor(result: ResponseWithHeaders<AuthToken>) {
        super();
        this.body = result.body;
        this.headers = result.headers;
    }
}

export class CR_UpdateRefreshTokenSuccess extends CR_200<AuthToken> {
    @ApiProperty({ type: AuthToken })
    override body: AuthToken;

    constructor(result: ResponseWithHeaders<AuthToken>) {
        super();
        this.body = result.body;
        this.headers = result.headers;
    }
}

export class CR_UserAlreadyExist extends CR_200_Fail<'userAlreadyExist'> {
    @ApiProperty({ type: 'userAlreadyExist' })
    error: 'userAlreadyExist';
}

export class CR_CannotCreateUser extends CR_200_Fail<'cannotCreateUser'> {
    @ApiProperty({ type: 'cannotCreateUser' })
    error: 'cannotCreateUser';
}

export class CR_CannotSendEmailConfirmation extends CR_200_Fail<'cannotSendEmailConfirmation'> {
    @ApiProperty({ type: 'cannotSendEmailConfirmation' })
    error: 'cannotSendEmailConfirmation';
}

export class CR_EmailOrPasswordIncorrect extends CR_200_Fail<'emailOrPasswordIncorrect'> {
    @ApiProperty({ type: 'emailOrPasswordIncorrect' })
    error: 'emailOrPasswordIncorrect';
}

export class CR_EmailNotConfirmed extends CR_200_Fail<'emailNotConfirmed'> {
    @ApiProperty({ type: 'emailNotConfirmed' })
    error: 'emailNotConfirmed';
}

export class CR_CannotUpdateUser extends CR_200_Fail<'cannotUpdateUser'> {
    @ApiProperty({ type: 'cannotUpdateUser' })
    error: 'cannotUpdateUser';
}

export class CR_CannotFindUser extends CR_200_Fail<'cannotFindUser'> {
    @ApiProperty({ type: 'cannotFindUser' })
    error: 'cannotFindUser';
}

export class CR_CannotCreateRefreshToken extends CR_200_Fail<'cannotCreateRefreshToken'> {
    @ApiProperty({ type: 'cannotCreateRefreshToken' })
    error: 'cannotCreateRefreshToken';
}

export class CR_CannotUpdateRefreshToken extends CR_200_Fail<'cannotUpdateRefreshToken'> {
    @ApiProperty({ type: 'cannotUpdateRefreshToken' })
    error: 'cannotUpdateRefreshToken';
}

export class CR_ConfirmationNotFound extends CR_200_Fail<'confirmationNotFound'> {
    @ApiProperty({ type: 'confirmationNotFound' })
    error: 'confirmationNotFound';
}

export class CR_EmailAlreadyConfirmed extends CR_200_Fail<'emailAlreadyConfirmed'> {
    @ApiProperty({ type: 'emailAlreadyConfirmed' })
    error: 'emailAlreadyConfirmed';
}
