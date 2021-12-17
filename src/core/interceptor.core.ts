import { Response } from 'express';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as R from 'ramda';

import { ControllerResponse } from './controller.core';
import { TransactionsContext } from '../utils/transactions.utils';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
    async intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Promise<Observable<unknown>> {
        const response: Response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            mergeMap(async (data) => {
                if (data instanceof ControllerResponse) {
                    const ctx = RequestContext.get<TransactionsContext>();
                    await ctx.transactions.start();
                    data.status ? await ctx.transactions.commit() : await ctx.transactions.abort();
                    response.status(data.status);
                    await ctx.transactions.stop();
                } else {
                    throw new Error(
                        'Every endpoint return should be instance of ControllerResponse',
                    );
                }
                return R.omit(['status'])(data);
            }),
        );
    }
}
