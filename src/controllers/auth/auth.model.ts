import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

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
