import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { CR_200, CR_200_Fail } from '../../core/controller.core';

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
    @ApiProperty()
    token: string;

    constructor(token: string) {
        this.token = token;
    }
}

export class CR_SignInSuccess extends CR_200<AuthToken> {
    @ApiProperty({ type: AuthToken })
    override body: AuthToken;

    constructor(body: AuthToken) {
        super();
        this.body = body;
    }
}

export class CR_ConfirmEmailSuccess extends CR_200<AuthToken> {
    @ApiProperty({ type: AuthToken })
    override body: AuthToken;

    constructor(body: AuthToken) {
        super();
        this.body = body;
    }
}

export class CR_UserAlreadyExist extends CR_200_Fail<'userAlreadyExist'> {
    @ApiProperty({ example: 'userAlreadyExist' })
    error: 'userAlreadyExist';
}

export class CR_CannotCreateUser extends CR_200_Fail<'cannotCreateUser'> {
    @ApiProperty({ example: 'cannotCreateUser' })
    error: 'cannotCreateUser';
}

export class CR_CannotSendEmailConfirmation extends CR_200_Fail<'cannotSendEmailConfirmation'> {
    @ApiProperty({ example: 'cannotSendEmailConfirmation' })
    error: 'cannotSendEmailConfirmation';
}

export class CR_EmailOrPasswordIncorrect extends CR_200_Fail<'emailOrPasswordIncorrect'> {
    @ApiProperty({ example: 'emailOrPasswordIncorrect' })
    error: 'emailOrPasswordIncorrect';
}

export class CR_EmailNotConfirmed extends CR_200_Fail<'emailNotConfirmed'> {
    @ApiProperty({ example: 'emailNotConfirmed' })
    error: 'emailNotConfirmed';
}

export class CR_CannotUpdateUser extends CR_200_Fail<'cannotUpdateUser'> {
    @ApiProperty({ example: 'cannotUpdateUser' })
    error: 'cannotUpdateUser';
}

export class CR_CannotFindUser extends CR_200_Fail<'cannotFindUser'> {
    @ApiProperty({ example: 'cannotFindUser' })
    error: 'cannotFindUser';
}

export class CR_ConfirmationNotFound extends CR_200_Fail<'confirmationNotFound'> {
    @ApiProperty({ example: 'confirmationNotFound' })
    error: 'confirmationNotFound';
}

export class CR_EmailAlreadyConfirmed extends CR_200_Fail<'emailAlreadyConfirmed'> {
    @ApiProperty({ example: 'emailAlreadyConfirmed' })
    error: 'emailAlreadyConfirmed';
}
