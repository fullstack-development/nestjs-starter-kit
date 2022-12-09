import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { IsEmail, IsNumber } from 'class-validator';
import { IsAddress, validateSync } from '../utils/validation.utils';
import { BaseError, isError } from './errors.core';

export type HeaderValue = string | number | Array<string>;

type ControllerResponseOptions = {
    body?: unknown;
    headers?: Record<string, HeaderValue>;
};

type ControllerResponseErrorOptions = {
    error: string;
    headers?: Record<string, HeaderValue>;
};

export class ControllerResponse {
    status: HttpStatus;
    success?: boolean;
    headers?: Record<string, HeaderValue>;
    body?: unknown;

    public static Success(options?: ControllerResponseOptions) {
        const response = new ControllerResponse();
        response.success = true;
        response.status = HttpStatus.OK;
        response.body = options?.body;
        response.headers = options?.headers;
        return response;
    }

    public static Fail(options: ControllerResponseErrorOptions) {
        const response = new ControllerResponse();
        response.success = false;
        response.status = HttpStatus.OK;
        response.body = { error: options.error };
        response.headers = options.headers;
        return response;
    }

    public static Error(status: HttpStatus, body?: unknown) {
        const response = new ControllerResponse();
        response.status = status;
        response.body = body;
        return response;
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

export function mapResponse<T, EI, EO>(data: T | BaseError<EI>) {
    return async (
        onData: (data: T) => ControllerResponse | Promise<ControllerResponse>,
        onError?: (e: BaseError<EI>) => BaseError<EO> | Promise<BaseError<EO>>,
    ) =>
        isError(data)
            ? onError
                ? Promise.resolve(onError(data))
                : Promise.resolve(data)
            : Promise.resolve(onData(data));
}
