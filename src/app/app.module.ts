import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user/user.controller';
import { ConfigService, ConfigServiceProvider } from '../services/config/config.service';

@Module({
    imports: [
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
                type: 'mysql',
                host: DB_ADDRESS,
                port: DB_PORT, // default: 3306
                username: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
                entities: ['**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
        }),
        UserController,
    ],
})
export class AppModule {}
