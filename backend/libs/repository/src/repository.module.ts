/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminEntity, BalanceEntity, ItemEntity, UserEntity } from '@lib/repository/entities';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { RepositoryModuleOptions } from './types/module.types';

export const entities = [UserEntity, BalanceEntity, ItemEntity, AdminEntity];

@Global()
@Module({})
export class RepositoryModule {
    static forRootAsync(options: {
        useFactory: (...args: Array<any>) => Promise<RepositoryModuleOptions> | RepositoryModuleOptions;
        inject?: Array<unknown>;
    }): DynamicModule {
        return {
            module: RepositoryModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    useFactory: async (...args: Array<any>) => {
                        const repositoryOptions = await options.useFactory(...args);
                        return {
                            type: 'postgres',
                            host: repositoryOptions.DB_HOST,
                            port: repositoryOptions.DB_PORT,
                            username: repositoryOptions.DB_USERNAME,
                            password: repositoryOptions.DB_PASSWORD,
                            database: repositoryOptions.DB_NAME,
                            synchronize: false,
                            migrationsTableName: 'migrations',
                            autoLoadEntities: true,
                        };
                    },
                    inject: options.inject || [],
                }),
                TypeOrmModule.forFeature(entities),
                ClsModule.forRoot({
                    plugins: [
                        new ClsPluginTransactional({
                            imports: [TypeOrmModule],
                            adapter: new TransactionalAdapterTypeOrm({
                                dataSourceToken: getDataSourceToken(),
                            }),
                        }),
                    ],
                }),
            ],
        };
    }
}
