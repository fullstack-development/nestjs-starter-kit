import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { BaseError, isError } from './errors.core';
import { IsEmail, IsNumber } from 'class-validator';
import { validateSync } from '../utils/validation.utils';

export type HeaderValue = string | number | Array<string>;

export class ControllerResponse {
    success: boolean;
    status: HttpStatus;
    headers?: Record<string, HeaderValue>;
    body?: unknown;
}

export class CR_200<T> extends ControllerResponse {
    _kind: 'CR_200';

    success: true;
    body?: T;
    headers?: Record<string, HeaderValue>;

    constructor() {
        super();
        this.success = true;
        this.status = HttpStatus.OK;
    }
}

export class CR_200_Fail<T> extends ControllerResponse {
    _kind: 'CR_200_Fail';

    success: false;
    error: T;
    message?: string;

    constructor() {
        super();
        this.success = false;
    }
}

export class CR_502 extends ControllerResponse {
    _kind: 'CR_502';

    errorId: string;
}

export class CR_400<T> extends ControllerResponse {
    _kind: 'CR_400';

    error: T;
    message: string;
}

interface IErrorsServiceHandler {
    handleError: <T extends string>(
        error: BaseError<T>,
        userId?: number,
    ) => Promise<BaseError<string> | { uuid: string }>;
}

export const processControllerError = async <T extends string>(
    error: BaseError<T>,
    errorsService: IErrorsServiceHandler,
) => {
    if (error.userErrorOnly) {
        const err = new CR_200_Fail<T>();
        err.status = HttpStatus.OK;
        err.error = error.error;
        err.success = false;
        return err;
    } else {
        const errorIdResult = await errorsService.handleError(error);
        if (isError(errorIdResult)) {
            throw new Error('Cannot find newly created error');
        }

        const err = new CR_502();
        err.errorId = errorIdResult.uuid;
        err.status = HttpStatus.INTERNAL_SERVER_ERROR;
        err.success = false;
        return err;
    }
};

export class RequestUser {
    @IsNumber()
    id: number;

    @IsEmail()
    email: string;
}

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = validateSync(RequestUser, request.user);
    if (user.status === 'fail') {
        throw new Error('Cannot get user from request, but authentication was passed');
    }
    return user.value;
});
