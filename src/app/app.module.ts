import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../controllers/auth/auth.controller';
import { UserController } from '../controllers/user/user.controller';
import { ConfigService, ConfigServiceProvider } from '../services/config/config.service';
import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransactionsContext } from '../utils/transactions.utils';
import { HttpInterceptor } from '../core/interceptor.core';

@Module({
    imports: [
        ConfigService,
        RequestContextModule.forRoot({
            contextClass: TransactionsContext,
            isGlobal: true,
        }),
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
                migrations: ['migrations/*.js'],
                migrationsTableName: 'migrations_typeorm',
                migrationsRun: true,
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
