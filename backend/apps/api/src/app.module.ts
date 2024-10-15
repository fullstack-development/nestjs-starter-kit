import { Interceptor } from '@lib/core';
import { RepositoryModule } from '@lib/repository';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [ConfigModule, RepositoryModule, UserModule, AuthModule],
    providers: [{ provide: APP_INTERCEPTOR, useClass: Interceptor }],
})
export class AppModule {}
