import { Response } from 'express';
import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { Observable } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import * as R from 'ramda';

import { ControllerResponse } from './controller.core';
import { TransactionsContext } from '../utils/transactions.utils';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
    async intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Promise<Observable<unknown>> {
        const ctx = RequestContext.get<TransactionsContext>();
        await ctx.transactions.start();
        const response: Response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            mergeMap(async (data) => {
                if (data instanceof ControllerResponse) {
                    data.status ? await ctx.transactions.commit() : await ctx.transactions.abort();
                    if (data.headers) {
                        Object.entries(data.headers).forEach(([key, value]) =>
                            response.setHeader(key, value),
                        );
                    }
                    response.status(data.status);
                    await ctx.transactions.stop();
                } else {
                    throw new Error(
                        'Every endpoint return should be instance of ControllerResponse',
                    );
                }
                return R.omit(['status', 'headers'])(data);
            }),
            catchError(async (error) => {
                await ctx.transactions.abort();
                await ctx.transactions.stop();
                response.status(error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
                response.send(error?.response);
            }),
        );
    }
}
