import { Response } from 'express';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RequestContext } from '@medibloc/nestjs-request-context';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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

        return await ctx.transactions.QueryRunner.manager.transaction(async (manager) => {
            ctx.transactions.setManager(manager);
            return next.handle().pipe(
                mergeMap(async (data) => {
                    if (data instanceof ControllerResponse) {
                        data.status
                            ? await ctx.transactions.commit()
                            : await ctx.transactions.abort();
                        response.status(data.status);
                        response.send(data.body);
                        await ctx.transactions.stop();
                    } else {
                        throw new Error(
                            'Every endpoint return should be instance of ControllerResponse',
                        );
                    }
                    return data;
                }),
            );
        });
    }
}
