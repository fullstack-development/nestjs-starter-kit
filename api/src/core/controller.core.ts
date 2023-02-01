import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IsEmail, IsNumber } from 'class-validator';
import { validateSync } from '../utils/validation.utils';
import { BaseError, isError } from './errors.core';

export type HeaderValue = string | number | Array<string>;

export class ControllerResponse<T, H extends string> {
    body?: T;
    headers?: Record<string, HeaderValue>;

    constructor(body?: T, headers?: Record<H, HeaderValue>) {
        this.body = body;
        this.headers = headers;
    }
}

export class RequestUser {
    @IsNumber()
    id: number;

    @IsEmail()
    email: string;
}

export const getRequestUser = (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = validateSync(RequestUser, request.user, {
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
    });
    if (user.status === 'fail') {
        throw new Error('Cannot get user from request, but authentication was passed');
    }
    return user.value;
};
export const User = createParamDecorator(getRequestUser);

export function mapResponse<T, E, R, H extends string>(
    data: T | BaseError<E>,
    onData: (data: T) => ControllerResponse<R, H> | Promise<ControllerResponse<R, H>>,
) {
    return isError(data) ? Promise.resolve(data) : Promise.resolve(onData(data));
}
