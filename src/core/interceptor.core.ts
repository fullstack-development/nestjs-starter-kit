import { Response } from 'express';
import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError, mergeMap } from 'rxjs/operators';
import * as R from 'ramda';

import { ControllerResponse } from './controller.core';
import { TransactionsContext } from '../utils/transactions.utils';
import { DatabaseServiceProvider } from '../services/database/database.service';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
    constructor(private db: DatabaseServiceProvider) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Promise<Observable<unknown>> {
        const response: Response = context.switchToHttp().getResponse();
        const ctx = RequestContext.get<TransactionsContext>();

        return from(
            this.db.Prisma.$transaction((prisma) => {
                ctx.transactions.init(prisma);

                return next
                    .handle()
                    .pipe(
                        mergeMap(async (data) => {
                            if (data instanceof ControllerResponse) {
                                if (!data.success) {
                                    throw data;
                                }
                                return data;
                            } else {
                                throw new Error(
                                    'Every endpoint return should be instance of ControllerResponse',
                                );
                            }
                        }),
                    )
                    .toPromise();
            }),
        ).pipe(
            map((data) => {
                response.status(HttpStatus.OK);
                if (data.headers) {
                    Object.entries(data.headers).forEach(([key, value]) =>
                        response.setHeader(key, value),
                    );
                }
                return R.omit(['status', 'headers'], data);
            }),
            catchError(async (error) => {
                if (error?.status === HttpStatus.OK) {
                    response.status(HttpStatus.OK);
                    response.send(R.omit(['status', 'headers'], error));
                } else {
                    response.status(error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
                    if (response.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
                        if (process.env['TEST'] !== 'true') {
                            response.send(
                                `${error?.response ?? error?.message}. Stack: ${
                                    process.env['FULL_PRODUCTION_MODE'] !== 'true'
                                        ? error?.stack
                                        : ''
                                }`,
                            );
                        } else {
                            response.send(error?.response ?? error?.message);
                        }
                    } else {
                        response.send(error?.response ?? error?.message);
                    }
                }
            }),
        );
    }
}
