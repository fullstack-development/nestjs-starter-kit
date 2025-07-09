/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, catchError, map, of } from 'rxjs';
import { ControllerResponse, FailResponseBody } from '../controller/controller.model';
import { objToString } from '../utils';

@Injectable()
export class Interceptor implements NestInterceptor {
    private logger = new Logger(Interceptor.name);

    constructor() {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const res: Response = context.switchToHttp().getResponse();
        const req = context.switchToHttp().getRequest();

        this.logger.log({
            message: 'Request',
            payload: {
                method: req.method,
                url: req.url,
                user: req.user,
            },
        });

        return next
            .handle()
            .pipe(
                map((data: ControllerResponse<unknown> | undefined | null) => {
                    if (!data) {
                        return null;
                    }

                    if (data.headers) {
                        for (const [header, value] of Object.entries(data.headers)) {
                            res.setHeader(header, value);
                        }
                    }

                    if (data.body.success) {
                        res.status(200);

                        this.logger.log({
                            message: 'Response',
                            payload: {
                                status: data.status,
                                method: req.method,
                                url: req.url,
                                body: data.body,
                                user: req.user,
                            },
                        });

                        return data.body;
                    }

                    throw { body: data.body, status: data.status };
                }),
            )
            .pipe(
                catchError((err: Error | { body: FailResponseBody<string>; status: number }) => {
                    if (err instanceof Error) {
                        let status = HttpStatus.INTERNAL_SERVER_ERROR;
                        let message = err.message;
                        if (err instanceof HttpException) {
                            const response = err.getResponse();
                            if (typeof response === 'object' && hasMessage(response)) {
                                message = objToString(response.message);
                            } else {
                                message = objToString(response);
                            }
                            status = err.getStatus();
                        }

                        this.logger.error({
                            message: 'INTERNAL_SERVER_ERROR',
                            payload: {
                                message,
                                stack: err.stack,
                                method: req.method,
                                url: req.url,
                                user: req.user,
                            },
                        });
                        res.status(status);
                        return of(message);
                    }

                    if (err?.body && !err.body.success) {
                        this.logger.error({
                            message: 'Error',
                            payload: {
                                body: err.body,
                                method: req.method,
                                url: req.url,
                                user: req.user,
                            },
                        });
                        res.status(err.status);
                        return of(objToString(err.body));
                    }

                    const unknownError = objToString(err);
                    this.logger.error({
                        message: 'UNKNOWN INTERNAL_SERVER_ERROR',
                        payload: {
                            error: unknownError,
                            method: req.method,
                            url: req.url,
                            user: req.user,
                        },
                    });
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                    return of(unknownError);
                }),
            );
    }
}

function hasMessage(v: object): v is { message: object | string } {
    return (v as any).hasOwnProperty('message');
}
