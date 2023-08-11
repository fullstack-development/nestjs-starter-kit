import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
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
import { AsyncContext, DatabaseProvider, Transactions, TRANSACTIONS_KEY } from '../../repository';
import { ControllerResponse } from './controller.core';
import {
    ErrorHandleMiddlewareCore,
    ErrorHandleMiddlewareProvider,
} from './errorHandleMiddleware.core';
import { BaseError, isBaseErrorString, isError } from './errors.core';

@Injectable()
export class HttpInterceptor implements NestInterceptor, OnModuleInit {
    private errorHandleMiddleware: ErrorHandleMiddlewareProvider | null = null;
    private logger = new Logger(HttpInterceptor.name);

    constructor(
        private moduleRef: ModuleRef,
        private ac: AsyncContext<string, Transactions>,
        private db: DatabaseProvider,
    ) {}

    async onModuleInit() {
        this.errorHandleMiddleware = await this.moduleRef.resolve(ErrorHandleMiddlewareCore);
        if (this.errorHandleMiddleware === null) {
            this.logger.log('No error handler where provided');
        }
    }

    async intercept(context: ExecutionContext, next: CallHandler<unknown>) {
        if (isRabbitContext(context)) {
            return next.handle();
        }
        const response: Response = context.switchToHttp().getResponse();
        this.ac.register();
        const ctx = new Transactions();
        this.ac.set(TRANSACTIONS_KEY, ctx);

        return from(
            this.db.UnsafeRepository.$transaction(
                async (prisma) => {
                    ctx.init(prisma);
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
                return data.body;
            }),
            catchError(async (error: BaseError<string> | Error | unknown) => {
                if (process.env['TEST'] !== 'true') {
                    if (
                        (isHttpError(error) && error.status >= 500) ||
                        (isError(error) && error.kind >= 500) ||
                        isException(error)
                    ) {
                        const errorText = (() => {
                            try {
                                return JSON.stringify({
                                    message: isException(error) ? error.message : error,
                                });
                            } catch {
                                return `${error}`;
                            }
                        })();
                        this.logger.error(errorText);
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
                    payload?: Record<string, unknown>;
                } = {
                    error: '',
                };

                if (isError(error)) {
                    body.error = `${error.error}`;
                    body.message = error.message;
                    body.stack = error.stackTrace;
                    body.payload = error.payload;
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

                response.send(makeResponse(body));
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

function makeResponse(body: {
    error: string;
    errorUniqId?: string | undefined;
    message?: string | undefined;
    stack?: string | undefined;
}) {
    if (process.env['TEST'] === 'true' || process.env['ENVIRONMENT'] === 'prod') {
        return R.omit(['stack'], body);
    }

    return body;
}
