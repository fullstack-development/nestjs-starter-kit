import { Module, Scope } from '@nestjs/common';
import { AuthController } from '../controllers/auth/auth.controller';
import { UserController } from '../controllers/user/user.controller';
import { ConfigService } from '../services/config/config.service';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransactionsContext } from '../utils/transactions.utils';
import { HttpInterceptor } from '../core/interceptor.core';
import { DatabaseService } from '../services/database/database.service';

@Module({
    imports: [
        ConfigService,
        DatabaseService,
        RequestContextModule.forRoot({
            contextClass: TransactionsContext,
            isGlobal: true,
        }),
        AuthController,
        UserController,
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
