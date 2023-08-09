import { HttpInterceptor } from '@lib/core';
import { DatabaseModule } from '@lib/repository';
import { Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthController } from '../controllers/auth/auth.controller';
import { UserController } from '../controllers/user/user.controller';
import { Config } from '../core/config/config.core';
import { AppController } from './../controllers/app.controller';

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
