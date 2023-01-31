import { RequestContext } from '@medibloc/nestjs-request-context';
import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor,
    OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Response } from 'express';
import * as R from 'ramda';
import { from, lastValueFrom } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ControllerResponse } from './controller.core';
import { DatabaseProvider } from './database/database.core';
import {
    ErrorHandleMiddlewareCore,
    ErrorHandleMiddlewareProvider,
} from './errorHandleMiddleware.core';
import { BaseError, isBaseErrorString, isError } from './errors.core';
import { TransactionsContext } from './transactions.core';

@Injectable()
export class HttpInterceptor implements NestInterceptor, OnModuleInit {
    private errorHandleMiddleware: ErrorHandleMiddlewareProvider | null = null;
    private logger = new Logger(HttpInterceptor.name);

    constructor(private moduleRef: ModuleRef, private db: DatabaseProvider) {}

    async onModuleInit() {
        this.errorHandleMiddleware = await this.moduleRef.resolve(ErrorHandleMiddlewareCore);
        if (this.errorHandleMiddleware === null) {
            this.logger.log('No error handler where provided');
        }
    }

    async intercept(context: ExecutionContext, next: CallHandler<unknown>) {
        const response: Response = context.switchToHttp().getResponse();
        const ctx = RequestContext.get<TransactionsContext>();

        return from(
            this.db.UnsafeRepository.$transaction(
                async (prisma) => {
                    await ctx.transactions.init(prisma);
                    return lastValueFrom(
                        next.handle().pipe(
                            mergeMap(async (data) => {
                                if (data instanceof ControllerResponse) {
                                    return data;
                                }

                                if (isError(data)) {
                                    if (isBaseErrorString(data)) {
                                        throw data;
                                    }
                                    throw new Error(
                                        'The type of the BaseError error property must be "string"',
                                    );
                                }

                                throw new Error(
                                    'Each endpoint return must be an instance of a ' +
                                        'ControllerResponse or a BaseError<string>',
                                );
                            }),
                        ),
                    );
                },
                { maxWait: 20000, timeout: 50000 },
            ),
        ).pipe(
            map((data) => {
                response.status(200);
                if (data.headers) {
                    Object.entries(data.headers).forEach(([key, value]) =>
                        response.setHeader(key, value),
                    );
                }
                return R.omit(['headers'], data.body);
            }),
            catchError(async (error: BaseError<string> | Error | unknown) => {
                if (process.env['TEST'] !== 'true') {
                    if ((isHttpError(error) && error.status >= 500) || !isHttpError(error)) {
                        this.logger.error(`${error}`);
                    }
                }

                if (isHttpError(error)) {
                    response.status(error.status);
                    response.send(error.response);
                    return;
                }

                const body: {
                    error: string;
                    errorUniqId?: string;
                    message?: string;
                    stack?: string;
                } = {
                    error: '',
                };

                if (isError(error)) {
                    body.error = `${error.error}`;
                    body.message = error.message;
                    body.stack = error.stackTrace;
                } else if (isException(error)) {
                    body.error = error.name;
                    body.message = error.message;
                    body.stack = error.stack;
                } else if (typeof error === 'object') {
                    body.error = 'Unknown error';
                    body.message = `${JSON.stringify(error)}`;
                } else {
                    body.error = 'Unknown error';
                    body.message = `${error}`;
                }

                if (isError(error)) {
                    response.status(error.kind);
                } else {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                }

                if (this.errorHandleMiddleware) {
                    body.errorUniqId = (
                        await this.errorHandleMiddleware.handleError(error)
                    ).errorUniqId;
                }

                if (process.env['TEST'] !== 'true') {
                    response.send(
                        `${R.omit(['stack'], body)}\nStack: ${
                            process.env['ENVIRONMENT'] !== 'prod' ? body?.stack : ''
                        }`,
                    );
                } else {
                    response.send(R.omit(['stack'], body));
                }
            }),
        );
    }
}

function isException(error: unknown): error is Error {
    return (
        typeof error === 'object' &&
        error !== null &&
        !Array.isArray(error) &&
        typeof error['name'] === 'string' &&
        Boolean(error['message'])
    );
}

function isHttpError(error: unknown): error is {
    status: number;
    response?: Record<string, unknown>;
} {
    return (
        typeof error === 'object' &&
        error !== null &&
        !Array.isArray(error) &&
        typeof error['status'] === 'number'
    );
}
