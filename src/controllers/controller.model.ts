import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { ErrorsServiceProvider } from '../services/errors/errors.service';
import { BaseError } from '../model/errors.model';
import { ResultFail } from '../model/result.model';
import { IsEmail, IsNumber } from 'class-validator';
import { validateSync } from '../utils/validation.utils';

export class ControllerResponse {
    success: boolean;
    status: HttpStatus;
    body?: unknown;
}

export const Success = (body: unknown) => {
    const response = new ControllerResponse();
    response.status = HttpStatus.OK;
    response.body = body;
    response.success = true;
    return response;
};

export const Fail = (status: HttpStatus, body: unknown) => {
    const response = new ControllerResponse();
    response.status = status;
    response.body = body;
    response.success = false;
    return response;
};

export const processControllerError = async (
    fail: ResultFail<BaseError>,
    errorsService: ErrorsServiceProvider,
) => {
    switch (fail.error.status) {
        case HttpStatus.OK:
            return { code: HttpStatus.OK, body: { status: false, error: fail.error.error } };
        case HttpStatus.BAD_REQUEST:
            return { code: HttpStatus.BAD_REQUEST, body: { error: fail.error.error } };
        case HttpStatus.INTERNAL_SERVER_ERROR:
            const uuid = await errorsService.handleError(fail);
            return { code: HttpStatus.INTERNAL_SERVER_ERROR, body: { uuid } };
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
