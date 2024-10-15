import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IsNumber } from 'class-validator';
import { BaseError, isError } from '../errors';

export type HeaderValue = string | number | Array<string>;

export class ContextUser {
    @IsNumber()
    id: number;
}

export type SuccessResponseBody<T> = {
    success: true;
    data?: T;
};

export type FailResponseBody<E> = {
    success: false;
    error: E;
    message?: string;
    stackTrace?: string;
    payload?: Record<string, unknown>;
};

export class ControllerResponse<T> {
    body: SuccessResponseBody<T> | FailResponseBody<T>;
    status: number;
    headers?: Record<string, HeaderValue>;

    constructor(
        body: SuccessResponseBody<T> | FailResponseBody<T>,
        status?: number,
        headers?: Record<string, HeaderValue>,
    ) {
        this.body = body;
        this.headers = headers;
        this.status = status ?? 200;
    }
}

export const getRequestUser = (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
};
export const User = createParamDecorator(getRequestUser);

export const makeResponse = async <T, E, R>(
    data: T | BaseError<E>,
    parseData: (data: T) => R | Promise<R>,
    getHeaders?: (data: T) => Record<string, HeaderValue> | Promise<Record<string, HeaderValue>>,
): Promise<ControllerResponse<R> | ControllerResponse<E>> => {
    if (isError(data)) {
        return makeErrorResponse(data);
    }
    return new ControllerResponse(
        {
            success: true,
            data: await parseData(data),
        },
        200,
        getHeaders && (await getHeaders(data)),
    );
};

export const makeErrorResponse = async <E>(err: BaseError<E>): Promise<ControllerResponse<E>> => {
    return new ControllerResponse(
        {
            success: false,
            error: err.error,
            message: err.message,
            ...(process.env['NODE_ENV'] === 'development' ? { payload: err.payload } : {}),
        },
        err.status,
    );
};
