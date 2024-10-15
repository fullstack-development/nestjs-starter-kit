import { IsEmail, IsString } from 'class-validator';

export class SignInBody {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
