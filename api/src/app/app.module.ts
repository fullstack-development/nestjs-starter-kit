import { RepositoryLibrary } from '@lib/repository';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthController } from '../controllers/auth/auth.controller';
import { UserController } from '../controllers/user/user.controller';
import { Config } from '../core/config/config.core';
import { Database } from '../core/database/database.core';
import { HttpInterceptor } from '../core/interceptor.core';
import { TransactionsContext } from '../core/transactions.core';
import { AppController } from './../controllers/app.controller';

@Module({
    imports: [
        Config,
        RepositoryLibrary,
        Database,
        RequestContextModule.forRoot({
            contextClass: TransactionsContext,
            isGlobal: true,
        }),
        AuthController,
        UserController,
        AppController,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            scope: Scope.REQUEST,
            useClass: HttpInterceptor,
        },
    ],
})
export class AppModule {}
