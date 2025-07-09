import { ConfigModule, Interceptor } from '@lib/core';
import { OpenobserveModule } from '@lib/logger';
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
        OpenobserveModule.registerAsync({
            inject: [EnvConfig],
            useFactory: (config: EnvConfig) => ({
                endpoint: config.OPENOBSERVE_ENDPOINT,
                key: config.OPENOBSERVE_KEY,
                organizationId: config.OPENOBSERVE_ORGANIZATION_ID,
                appId: config.OPENOBSERVE_APP_ID,
                user: config.OPENOBSERVE_USER,
            }),
        }),
        UserModule,
        AuthModule,
    ],
    providers: [{ provide: APP_INTERCEPTOR, useClass: Interceptor }],
})
export class AppModule {}
