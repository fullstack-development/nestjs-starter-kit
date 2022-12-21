import { User as UserApi } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsNumber,
} from 'class-validator';

export class UserJson implements Omit<UserApi, 'hash'> {
    @IsNumber()
    id: number;

    @IsEmail()
    email: string;

    @IsBoolean()
    emailConfirmed: boolean;

    @IsDate()
    @Transform((v) => new Date(v.value))
    created: Date;
}
