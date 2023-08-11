import { HttpInterceptor } from '@lib/core';
import { DatabaseModule } from '@lib/repository';
import { Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from '../controllers/rest/app.controller';
import { AuthController } from '../controllers/rest/auth/auth.controller';
import { UserController } from '../controllers/rest/user/user.controller';
import { Config } from '../core/config/config.core';

@Module({
    imports: [Config, DatabaseModule.forRoot(), AuthController, UserController, AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            scope: Scope.REQUEST,
            useClass: HttpInterceptor,
        },
    ],
})
export class AppModule {}
