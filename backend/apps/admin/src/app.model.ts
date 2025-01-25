import { getRequestUser } from '@lib/core';
import { createParamDecorator } from '@nestjs/common';
import { IsEmail, IsNumber } from 'class-validator';
import { BaseError, isError } from '../../../libs/core/src/errors';

export class ContextAdmin {
    @IsNumber()
    id: number;

    @IsEmail()
    email: string;
}

export const Admin = createParamDecorator(getRequestUser);

export const makeAdminResponse = async <T, E, R>(data: T | BaseError<E>, parseData: (data: T) => R | Promise<R>) => {
    if (isError(data)) {
        return data.error;
    }
    return await parseData(data);
};
