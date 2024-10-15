import { IsString } from 'class-validator';

export class SignUpBody {
    @IsString()
    email: string;

    @IsString()
    password: string;
}

export class SignInBody {
    @IsString()
    email: string;

    @IsString()
    password: string;
}

export class ConfirmEmailBody {
    @IsString()
    token: string;
}
