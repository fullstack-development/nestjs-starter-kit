import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BasicError, isError } from './errors.core';
import { IsEmail, IsNumber } from 'class-validator';
import { validateSync } from '../utils/validation.utils';
import { makeApiResponsesDecorator } from '../utils/openapi.utils';

export class ControllerResponse {
    success: boolean;

    status: HttpStatus;

    body?: unknown;
}

export class CR_200<T> extends ControllerResponse {
    _kind: 'CR_200';

    @ApiProperty({ type: 'true' })
    success: true;

    body?: T;

    constructor() {
        super();
        this.success = true;
        this.status = HttpStatus.OK;
    }
}

export class CR_200_Fail<T> extends ControllerResponse {
    _kind: 'CR_200_Fail';

    @ApiProperty({ type: 'false' })
    success: false;

    @ApiProperty()
    error: T;

    @ApiProperty({ required: false })
    message?: string;

    constructor() {
        super();
        this.success = false;
    }
}

export class CR_502 extends ControllerResponse {
    _kind: 'CR_502';

    @ApiProperty()
    errorId: string;
}

export class CR_400<T> extends ControllerResponse {
    _kind: 'CR_400';

    @ApiProperty()
    error: T;

    @ApiProperty()
    message: string;
}

interface IErrorsServiceHandler {
    handleError: <T extends string>(
        error: BasicError<T>,
        userId?: number,
    ) => Promise<BasicError<string> | { uuid: string }>;
}

export const processControllerError = async <T extends string>(
    error: BasicError<T>,
    errorsService: IErrorsServiceHandler,
) => {
    if (error.userErrorOnly) {
        const err = new CR_200_Fail<T>();
        err.status = HttpStatus.OK;
        err.status = HttpStatus.OK;
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

export const ApiResponses = makeApiResponsesDecorator(CR_502);
