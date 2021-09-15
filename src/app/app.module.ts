import { Response } from 'express';
import { CallHandler, ExecutionContext, Injectable, Module, NestInterceptor } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../controllers/auth/auth.controller';
import { UserController } from '../controllers/user/user.controller';
import { ConfigService, ConfigServiceProvider } from '../services/config/config.service';
import { RequestContext, RequestContextModule } from '@medibloc/nestjs-request-context';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ControllerResponse } from '../controllers/controller.model';
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

@Module({
    imports: [
        RequestContextModule.forRoot({
            contextClass: TransactionsContext,
            isGlobal: true,
        }),
        ConfigService,
        TypeOrmModule.forRootAsync({
            imports: [ConfigService],
            inject: [ConfigServiceProvider],
            useFactory: ({
                DB_ADDRESS,
                DB_PASSWORD,
                DB_USER,
                DB_NAME,
                DB_PORT,
            }: ConfigServiceProvider) => ({
                type: 'postgres',
                host: DB_ADDRESS,
                port: DB_PORT, // default: 5432
                username: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
                entities: ['**/*.entity.js'],
                synchronize: true,
            }),
        }),
        AuthController,
        UserController,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpInterceptor,
        },
    ],
})
export class AppModule {}
