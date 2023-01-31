import { IsEmail, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ControllerResponse } from '../../core/controller.core';
import { CannotFindEmailConfirm, CannotFindUser } from '../../core/database/database.model';
import {
    CannotSendEmailConfirmation,
    EmailAlreadyConfirmed,
    EmailNotConfirmed,
} from '../../services/auth/auth.model';
import { EmailOrPasswordIncorrect, UserAlreadyExist } from '../../services/user/user.model';

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
    @IsUUID('4')
    confirmUuid: string;
}

export type SignUpResponse =
    | ControllerResponse<never, never>
    | UserAlreadyExist
    | CannotSendEmailConfirmation;

export type SignInResponse =
    | CannotFindUser
    | EmailOrPasswordIncorrect
    | EmailNotConfirmed
    | ControllerResponse<{ token: string }, 'Set-Cookie'>;

export type ConfirmEmailResponse =
    | ControllerResponse<{ token: string }, 'Set-Cookie'>
    | CannotFindUser
    | EmailAlreadyConfirmed
    | CannotFindEmailConfirm;

export type HandleRefreshTokenResponse =
    | ControllerResponse<{ token: string }, 'Set-Cookie'>
    | CannotFindUser;
