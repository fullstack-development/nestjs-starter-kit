import { ConfigModule, Interceptor } from '@lib/core';
import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EnvConfig } from './config/config.model';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.register(EnvConfig),
        RepositoryModule.forRootAsync({
            inject: [EnvConfig],
            useFactory: (config: EnvConfig) => config,
        }),
        UserModule,
        AuthModule,
    ],
    providers: [{ provide: APP_INTERCEPTOR, useClass: Interceptor }],
})
export class AppModule {}
